pragma solidity ^0.4.17;

import "./Interfaces.sol";
import "./ExchangeProviderInterface.sol";
import "./ExchangeAdapterBase.sol";
// import "../permission/PermissionProviderInterface.sol";
import "./ExchangePermissions.sol";
import "../libs/utils.sol";

contract ExchangeProvider is ExchangeProviderInterface, ExchangePermissions {

    IMarketOrderCallback marketOrderCallback;

    IExchangeAdapterManager exchangeManager;

    struct MarketOrder {
        ERC20[]                 tokens;
        uint[]                  amounts; // TODO:optional
        uint[]                  rates; // TODO:optional
        bytes32[]               exchanges;
        uint[]                  adapterOrdersId;
        address                 deposit;
        MarketOrderStatus       orderStatus;
    }

    mapping (uint => MarketOrder) private orders;

    mapping (bytes32 => uint ) adapterOrders; // sha3(exchange, uint) => orderId

    mapping (uint => uint) private balances;

    function ExchangeProvider(address _exchangeManager, address _permission) public 
    ExchangePermissions(_permission)
    {
        if (_exchangeManager != 0x0) {
            _setExchangeManager(_exchangeManager);
        }
    }
    
    function setExchangeManager(address _exchangeManager) public onlyExchangeOwner {
        _setExchangeManager(_exchangeManager);
    }

    function _setExchangeManager(address _exchangeManager) private  {
        exchangeManager = IExchangeAdapterManager(_exchangeManager);
    }

    // TODO: Lock 
    function setMarketOrderCallback(IMarketOrderCallback _callback) public onlyExchangeOwner {
        marketOrderCallback = _callback;
        return;
    }

    modifier onlyCore(){
        require(msg.sender == address(marketOrderCallback) || address(marketOrderCallback) == 0x0);
        _;
    }

    modifier onlyAdapter(){
        require(exchangeManager.isValidAdapter(msg.sender));
        _;
    }
   
    function startPlaceOrder(uint orderId, address deposit)
    external onlyCore returns(bool)
    {
        
        if(orders[orderId].tokens.length > 0){
            return false;
        }
        
        orders[orderId] = MarketOrder({
            tokens: new ERC20[](0),
            amounts: new uint[](0),
            rates: new uint[](0),
            exchanges: new bytes32[](0),
            adapterOrdersId: new uint[](0),
            deposit: deposit,
            orderStatus:MarketOrderStatus.Pending
        });
        return true;
    }
    
    function addPlaceOrderItem(uint orderId, ERC20 token, uint amount, uint rate)
    external onlyCore returns(bool)
    {
        return _addPlaceOrderItem(orderId, 0, token, amount, rate);
    }

    function addPlaceOrderItemByExchangeId(uint orderId, bytes32 exchangeId, ERC20 token, uint amount, uint rate)
    external onlyCore returns(bool)
    {

        if(exchangeId == 0){
            return false;
        }
        if(exchangeManager.getExchangeAdapter(exchangeId) == 0x0){
            return false;
        }
        return _addPlaceOrderItem(orderId, exchangeId, token, amount, rate);
    }

    function _addPlaceOrderItem(uint orderId, bytes32 exchangeId, ERC20 token, uint amount, uint rate) private returns (bool){
        MarketOrder memory order = orders[orderId];
        for (uint i = 0; i < order.tokens.length; i++) {
            if(address(order.tokens[i]) == address(token)){
                return false;
            }
        }
        orders[orderId].tokens.push(token);
        orders[orderId].amounts.push(amount);
        orders[orderId].rates.push(rate);
        orders[orderId].exchanges.push(exchangeId);
        return true;
    }

    function endPlaceOrder(uint orderId)
    external onlyCore payable returns(bool)
    {
        
        if(!checkOrderValid(orderId)){
            return false;
        }
        balances[orderId] = msg.value;
        
        MarketOrder memory order = orders[orderId];

        for (uint i = 0; i < order.tokens.length; i++ ) {
            
            IExchangeAdapter adapter;
            if(order.exchanges[i] != 0){
                adapter = IExchangeAdapter(exchangeManager.getExchangeAdapter(order.exchanges[i]));
            }else{
                bytes32 exchangeId = exchangeManager.pickExchange(order.tokens[i],order.amounts[i],order.rates[i]);
                if(exchangeId == 0){
                    return false;
                }
                adapter = IExchangeAdapter(exchangeManager.getExchangeAdapter(exchangeId));
                orders[orderId].exchanges[i] = exchangeId;
                order.exchanges[i] = exchangeId;
            }

            uint adapterOrderId = adapter.placeOrder(
                order.exchanges[i],
                order.tokens[i], 
                order.amounts[i], 
                order.rates[i], 
                this);

            if(adapterOrderId == 0){
                return false;
            }

            orders[orderId].adapterOrdersId.push(adapterOrderId);
            
            if(adapter.getOrderStatus(adapterOrderId) == int(ExchangeAdapterBase.OrderStatus.Approved)){
                if(!adapterApprovedImmediately(orderId, adapterOrderId, adapter, order.tokens[i], order.amounts[i], order.rates[i], order.deposit)){
                    revert();
                    return false;
                }
            }
            adapterOrders[keccak256(address(adapter),adapterOrderId)] = orderId;
        }
        
        orders[orderId].orderStatus = MarketOrderStatus.Completed;
        return true;
    }
    
    function checkOrderValid(uint orderId) private view returns(bool) {
        
        uint total = 0;
        MarketOrder memory order = orders[orderId];
        if(order.tokens.length == 0){
            return false;
        }
        for(uint i = 0; i < order.amounts.length; i++ ){
            total += order.amounts[i];
        }
        if(total != msg.value){
            return false;
        }
        return true;
    }

    function getExpectAmount(uint eth, uint rate) internal pure returns(uint){
        // TODO: asume all token decimals is 18
        return Utils.calcDstQty(eth, 18, 18, rate);
    }
    
    function adapterApprovedImmediately(uint orderId, uint adapterOrderId, IExchangeAdapter adapter, ERC20 token, uint amount, uint rate, address deposit) private returns(bool){

        address owner = address(adapter);
        uint expectAmount = getExpectAmount(amount, rate);
        if(token.allowance(owner, this) < expectAmount){
            return false;
        }
        if(!token.transferFrom(owner, deposit, expectAmount)){
            return false;
        }
        balances[orderId] -= amount;
        // pay eth
        if(!adapter.payOrder.value(amount)(adapterOrderId)){
            return false;
        }
        int status = adapter.getOrderStatus(adapterOrderId); 
        return status == int(ExchangeAdapterBase.OrderStatus.Completed);
    }

    // owner可以直接是msg.sender
    // TODO: only to be called by adapters
    function adapterApproved(uint adapterOrderId, address tokenOwner, address payee, uint completedAmount)
    external onlyAdapter returns (bool)
    {

        uint orderId = adapterOrders[keccak256(msg.sender, adapterOrderId)];
        if(orderId == 0){
            return false;
        }

        // TODO: valid order stauts
        MarketOrder memory order = orders[orderId];
        bool found = false;
        for(uint i = 0; i < order.adapterOrdersId.length; i++){
            if(order.adapterOrdersId[i] == adapterOrderId){
                found = true;
                break;
            }
        }
        if (!found){
            return false;
        }

        ERC20 token = order.tokens[i];

        uint expectAmount = getExpectAmount(completedAmount, order.rates[i]);
        if(token.allowance(tokenOwner, this) < expectAmount){
            return false;
        }

        if(!token.transferFrom(tokenOwner, order.deposit, expectAmount)){
            return false;
        }
        balances[orderId] -= completedAmount;
        payee.transfer(completedAmount);

        // checkMarketOrderStatus(adapterOrderId);
        return true;
    }
   
    // function checkMarketOrderStatus(uint orderId) private returns (bool){

    //     MarketOrder memory order = orders[orderId];
    //     for(uint i = 0; i < order.adapterOrdersId.length;i++){
    //         // TODO: define 1 as done, including completed,failed,cancelled,etc.
    //         if(order.exchanges[i].getOrderStatus(order.adapterOrdersId[i])!=1){
    //             return false;
    //         }
    //     }
    //     // all adapters order done,let's notify core smart contract;
    //     if (address(marketOrderCallback) != 0x0){
    //         marketOrderCallback.MarketOrderStatusUpdated(orderId, 1);
    //     }
        
    //     return true;
    // }

    function cancelOrder(uint orderId)
    external onlyCore returns (bool success) {
        
        MarketOrder memory order = orders[orderId];
        require(order.tokens.length > 0);
        require(order.orderStatus == MarketOrderStatus.Pending);

        uint i = 0;
        for(i = 0; i < order.tokens.length; i++) {
            IExchangeAdapter adapter = IExchangeAdapter(exchangeManager.getExchangeAdapter(order.exchanges[i]));
            adapter.cancelOrder(order.adapterOrdersId[i]);
        }
        return true;
    }

    event LogAddress(string desc, address addr);
    event LogBytes32(string desc, bytes32 value);
    event LogUint(string desc, uint value);

    function getSubOrderStatus(uint orderId, ERC20 token) external view returns (MarketOrderStatus){

        MarketOrder memory order = orders[orderId];

        bool found = false;
        for(uint i = 0; i < order.tokens.length; i++){
            if(address(order.tokens[i]) == address(token)){
                found = true;
                break;
            }
        }
        require(found);

        IExchangeAdapter adapter = IExchangeAdapter(exchangeManager.getExchangeAdapter(order.exchanges[i]));
        ExchangeAdapterBase.OrderStatus status = ExchangeAdapterBase.OrderStatus(adapter.getOrderStatus(order.adapterOrdersId[i]));
        if (status == ExchangeAdapterBase.OrderStatus.Pending || status == ExchangeAdapterBase.OrderStatus.Approved) {
            return MarketOrderStatus.Pending;
        } else if (status == ExchangeAdapterBase.OrderStatus.Completed) {
            return MarketOrderStatus.Completed;
        } else if (status == ExchangeAdapterBase.OrderStatus.Cancelled) {
            return MarketOrderStatus.Cancelled; 
        } else {
            return MarketOrderStatus.Errored;
        }
    }

    function checkTokenSupported(ERC20 token) external view returns (bool){
        require(address(token) != 0x0);
        return exchangeManager.checkTokenSupported(token);
    }
}