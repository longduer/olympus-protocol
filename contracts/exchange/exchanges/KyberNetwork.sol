pragma solidity ^0.4.17;

import "../ExchangeAdapterBase.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract KyberNetwork {

    function getExpectedRate(ERC20 src, ERC20 dest, uint srcQty)
        external view returns (uint expectedRate, uint slippageRate);

    function trade(
        ERC20 source,
        uint srcAmount,
        ERC20 dest,
        address destAddress,
        uint maxDestAmount,
        uint minConversionRate,
        address walletId)
        external payable returns(uint);
}

contract KyberNetworkExchange is ExchangeAdapterBase {

    KyberNetwork kyber;
    bytes32 name;
    bytes32 exchangeId;
    ERC20 constant ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);
    uint orderId = 0;

    struct Order{
        OrderStatus status;
        uint amount;
    }

    Status public status;

    mapping (uint=>Order) orders;

    event PlacedOrder(uint orderId);

    function KyberNetworkExchange(KyberNetwork _kyber) public{
        require(address(_kyber) != 0x0);
        kyber = _kyber;
        status = Status.ENABLED;
    }

    function addExchange(bytes32 _id, bytes32 _name)
    public returns(bool)
    {
        exchangeId = _id;
        name = _name;
        return true;
    }

    function getExchange(bytes32 _id)
    public view returns(bytes32, Status)
    {
        return (name, status);
    }

    function enable(bytes32 /*_id*/) public returns(bool){
        status = Status.ENABLED;
        return true;
    }

    function disable(bytes32 /*_id*/) public returns(bool){
        status = Status.DISABLED;
        return true;
    }

    function isEnabled(bytes32 /*_id*/) external view returns (bool success) {
        return status == Status.ENABLED;
    }

    function getRate(bytes32 /*id*/, ERC20 token, uint amount) external view returns(int){
        uint expectedRate;
        uint slippageRate;
        (expectedRate, slippageRate) = kyber.getExpectedRate(ETH_TOKEN_ADDRESS, token, amount);
        return int(slippageRate);
    }
    
    function placeOrder(bytes32 /*id*/, ERC20 dest, uint amount, uint rate, address deposit)
    external payable returns(uint adapterOrderId)
    {
        
        if (address(this).balance < amount) {
            return 0;
        }

        uint expectedRate;
        uint slippageRate;

        (expectedRate, slippageRate) = kyber.getExpectedRate(ETH_TOKEN_ADDRESS, dest, amount);
        if(slippageRate < rate){
            return 0;
        }

        /*uint actualAmount = kyber.trade.value(amount)(*/
        kyber.trade.value(amount)(
            ETH_TOKEN_ADDRESS,
            amount,
            dest,
            this,
            2**256 - 1,
            slippageRate,
            0x0);
        uint expectAmount = getExpectAmount(amount, rate);
        
        /** 
        // Kyber Bug in Kovan that actualAmount returns always zero
        // require(actualAmount > expectAmount);
        */
        
        if(!dest.approve(deposit, expectAmount)){
            return 0;
        }
        orders[++orderId] = Order({
            status:OrderStatus.Approved,
            amount:amount
        });
        emit PlacedOrder(orderId);
        return orderId;
    }

    function payOrder(uint adapterOrderId) external payable returns(bool){
        Order memory o = orders[adapterOrderId];
        if(o.status != OrderStatus.Approved){
            revert();
            return false;
        }
        if(o.amount != msg.value){
            revert();
            return false;
        }
        orders[adapterOrderId].status = OrderStatus.Completed;
        return true;
    }

    function cancelOrder(uint adapterOrderId) external returns(bool){
        Order memory o = orders[adapterOrderId];
        require(o.amount > 0);

        if(o.status != OrderStatus.Pending){
            return false;
        }

        orders[adapterOrderId].status = OrderStatus.Cancelled;
        return true;
    }

    function getOrderStatus(uint adapterOrderId) external view returns(OrderStatus){

        return orders[adapterOrderId].status;
    }
    
    function() public payable { }
}