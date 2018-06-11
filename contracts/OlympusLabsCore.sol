pragma solidity ^0.4.22;

import "./libs/Manageable.sol";
import "./libs/SafeMath.sol";
import "./libs/Converter.sol";
import "./exchange/ExchangeProviderInterface.sol";
import "./price/PriceProviderInterface.sol";
import "./strategy/StrategyProviderInterface.sol";
import "./permission/PermissionProviderInterface.sol";
import { StorageTypeDefinitions as STD, OlympusStorageInterface } from "./storage/OlympusStorage.sol";
import { TypeDefinitions as TD } from "./libs/Provider.sol";
import "./whitelist/WhitelistProviderInterface.sol";
import "./Tokenization/TokenizationProvider.sol";
import "./libs/FundTemplate.sol";
contract OlympusLabsCore is Manageable {
    using SafeMath for uint256;

    event IndexOrderUpdated (uint orderId);
    event Log(string message);
    event LogNumber(uint number);
    event LogAddress(address message);
    event LogAddresses(address[] message);
    event LogNumbers(uint[] numbers);
    event LOGDEBUG(address);

    ExchangeProviderInterface internal exchangeProvider =  ExchangeProviderInterface(address(0x0));
    StrategyProviderInterface internal strategyProvider = StrategyProviderInterface(address(0x0));
    PriceProviderInterface internal priceProvider = PriceProviderInterface(address(0x0));
    OlympusStorageInterface internal olympusStorage = OlympusStorageInterface(address(0x0));
    WhitelistProviderInterface internal whitelistProvider;
    TokenizationProvider internal _Tokenization;
    ERC20 private constant MOT = ERC20(address(0x41dee9f481a1d2aa74a3f1d0958c1db6107c686a));
    // TODO, update for mainnet: 0x263c618480DBe35C300D8d5EcDA19bbB986AcaeD

    uint public feePercentage = 100;
    uint public MOTDiscount = 25;
    uint public constant DENOMINATOR = 10000;

    uint public minimumInWei = 0;
    uint public maximumInWei;

    modifier allowProviderOnly(TD.ProviderType _type) {
        require(msg.sender == subContracts[uint8(_type)]);
        _;
    }
    modifier allowTokenizationOnly() {
        require(msg.sender == address(_Tokenization));
        _;
    }

    modifier onlyOwner() {
        require(permissionProvider.has(msg.sender, permissionProvider.ROLE_CORE_OWNER()));
        _;
    }

    modifier onlyAllowed(){
        require(address(whitelistProvider) == 0x0 || whitelistProvider.isAllowed(msg.sender));
        _;
    }

    PermissionProviderInterface internal permissionProvider;

    function OlympusLabsCore(address _permissionProvider) public {
        permissionProvider = PermissionProviderInterface(_permissionProvider);
    }

    function() payable public {
        revert();
    }

    function getStrategyCount() public view returns (uint length)
    {
        return strategyProvider.getStrategyCount();
    }

    function getStrategy(uint strategyId) public view returns (
        string name,
        string description,
        string category,
        address[] memory tokens,
        uint[] memory weights,
        uint followers,
        uint amount,
        string exchangeName)
    {
        bytes32 _exchangeName;
        uint tokenLength = strategyProvider.getStrategyTokenCount(strategyId);
        tokens = new address[](tokenLength);
        weights = new uint[](tokenLength);

        (,name,description,category,,,followers,amount,_exchangeName) = strategyProvider.getStrategy(strategyId);
        (,,,,tokens,weights,,,) = strategyProvider.getStrategy(strategyId);
        exchangeName = Converter.bytes32ToString(_exchangeName);
    }

    function getStrategyTokenAndWeightByIndex(uint strategyId, uint index) public view returns (
        address token,
        uint weight
        )
    {
        uint tokenLength = strategyProvider.getStrategyTokenCount(strategyId);
        require(index < tokenLength);

        (token, weight) = strategyProvider.getStrategyTokenByIndex(strategyId, index);
    }

    // Forward to Price smart contract.
    function getPrice(address tokenAddress, uint srcQty) public view returns (uint price){
        require(tokenAddress != address(0));
        (, price) = priceProvider.getRates(tokenAddress, srcQty);
        return price;
    }

    function getStrategyTokenPrice(uint strategyId, uint tokenIndex) public view returns (uint price) {
        uint totalLength;

        uint tokenLength = strategyProvider.getStrategyTokenCount(strategyId);
        require(tokenIndex <= totalLength);
        address[] memory tokens;
        uint[] memory weights;
        (,,,,tokens,weights,,,) = strategyProvider.getStrategy(strategyId);

        //Default get the price for one Ether

        return getPrice(tokens[tokenIndex], 10**18);
    }

    function setProvider(uint8 _id, address _providerAddress) public onlyOwner returns (bool success) {
        bool result = super.setProvider(_id, _providerAddress);
        TD.ProviderType _type = TD.ProviderType(_id);

        if(_type == TD.ProviderType.Strategy) {
            emit Log("StrategyProvider");
            strategyProvider = StrategyProviderInterface(_providerAddress);
        } else if(_type == TD.ProviderType.Exchange) {
            emit Log("ExchangeProvider");
            exchangeProvider = ExchangeProviderInterface(_providerAddress);
        } else if(_type == TD.ProviderType.Price) {
            emit Log("PriceProvider");
            priceProvider = PriceProviderInterface(_providerAddress);
        } else if(_type == TD.ProviderType.Storage) {
            emit Log("StorageProvider");
            olympusStorage = OlympusStorageInterface(_providerAddress);
        } else if(_type == TD.ProviderType.Whitelist) {
            emit Log("WhitelistProvider");
            whitelistProvider = WhitelistProviderInterface(_providerAddress);
        } else if(_type == TD.ProviderType.TokenizationProvider) {
            emit Log("TokenizationProvider");
            _Tokenization = TokenizationProvider(_providerAddress);
        } else {
            emit Log("Unknown provider type supplied.");
            revert();
        }

        return result;
    }

    function buyIndex(uint strategyId, address depositAddress, bool feeIsMOT)
    public onlyAllowed payable returns (uint indexOrderId)
    {
        require(msg.value > minimumInWei);
        if(maximumInWei > 0){
            require(msg.value <= maximumInWei);
        }
        uint tokenLength = strategyProvider.getStrategyTokenCount(strategyId);
        // can't buy an index without tokens.
        require(tokenLength > 0);
        address[] memory tokens = new address[](tokenLength);
        uint[] memory weights = new uint[](tokenLength);
        bytes32 exchangeId;

        (,,,,tokens,weights,,,exchangeId) = strategyProvider.getStrategy(strategyId);

        uint[3] memory amounts;
        amounts[0] = msg.value; //uint totalAmount
        amounts[1] = getFeeAmount(amounts[0], feeIsMOT); // fee
        amounts[2] = payFee(amounts[0], amounts[1], msg.sender, feeIsMOT);

        // create order.
        indexOrderId = olympusStorage.addOrderBasicFields(
          strategyId,
          msg.sender,
          amounts[0],
          amounts[1],
          exchangeId
        );

        uint[][4] memory subOrderTemp;
        // 0: token amounts
        // 1: estimatedPrices
        subOrderTemp[0] = initializeArray(tokenLength);
        subOrderTemp[1] = initializeArray(tokenLength);

        emit LogNumber(indexOrderId);


        require(exchangeProvider.startPlaceOrder(indexOrderId, depositAddress));

        for (uint i = 0; i < tokenLength; i ++ ) {

            // ignore those tokens with zero weight.
            if(weights[i] <= 0) {
                continue;
            }
            // token has to be supported by exchange provider.
            if(!exchangeProvider.checkTokenSupported(ERC20(tokens[i]))){
                emit Log("Exchange provider doesn't support");
                revert();
            }

            // check if price provider supports it.
            if(!priceProvider.checkTokenSupported(tokens[i])){
                emit Log("Price provider doesn't support");
                revert();
            }

            subOrderTemp[0][i] = amounts[2] * weights[i] / 100; // Amount
            subOrderTemp[1][i] = getPrice(tokens[i], subOrderTemp[0][i]); // Price

            emit LogAddress(tokens[i]);
            emit LogNumber(subOrderTemp[0][i]);
            emit LogNumber(subOrderTemp[1][i]);
            require(exchangeProvider.addPlaceOrderItem(indexOrderId, ERC20(tokens[i]), subOrderTemp[0][i], subOrderTemp[1][i]));
        }

        olympusStorage.addTokenDetails(
            indexOrderId, tokens, weights, subOrderTemp[0], subOrderTemp[1]
        );


        emit LogNumber(amounts[2]);
        require((exchangeProvider.endPlaceOrder.value(amounts[2])(indexOrderId)));


        strategyProvider.updateFollower(strategyId, true);

        strategyProvider.incrementStatistics(strategyId, msg.value);

        return indexOrderId;
    }

    function initializeArray(uint length) private pure returns (uint[]){
        return new uint[](length);
    }

    function resetOrderIdTo(uint _start) external onlyOwner returns (uint) {
        return olympusStorage.resetOrderIdTo(_start);
    }

    // For app/3rd-party clients to check details / status.
    function getIndexOrder(uint _orderId) public view returns
    (uint[])
    {
        // 0 strategyId
        // 1 dateCreated
        // 2 dateCompleted
        // 3 amountInWei
        // 4 tokenLength
        uint[] memory orderPartial = new uint[](5);
        address[] memory buyer = new address[](1);
        bytes32[] memory exchangeId = new bytes32[](1);
        STD.OrderStatus[] memory status = new STD.OrderStatus[](1);


        (orderPartial[0], buyer[0], status[0], orderPartial[1]) = olympusStorage.getIndexOrder1(_orderId);
        (orderPartial[2], orderPartial[3], orderPartial[4], exchangeId[0]) = olympusStorage.getIndexOrder2(_orderId);
        address[] memory tokens = new address[](orderPartial[4]);

        for(uint i = 0; i < orderPartial[4]; i++){
            tokens[i] = olympusStorage.getIndexToken(_orderId, i);
        }
        return (
          orderPartial
        );
    }

    function updateIndexOrderToken(
        uint _orderId,
        address _tokenAddress,
        uint _actualPrice,
        uint _totalTokenAmount,
        uint _completedQuantity
    ) external allowProviderOnly(TD.ProviderType.Exchange) returns (bool success)
    {
        uint completedTokenAmount;
        uint tokenIndex;
        (completedTokenAmount, tokenIndex) = olympusStorage.getOrderTokenCompletedAmount(_orderId,_tokenAddress);

        ExchangeAdapterBase.OrderStatus status;

        if(completedTokenAmount == 0 && _completedQuantity < completedTokenAmount){
            status = ExchangeAdapterBase.OrderStatus.PartiallyCompleted;
        }

        if(_completedQuantity >= completedTokenAmount){
            status = ExchangeAdapterBase.OrderStatus.Completed;
        }
        olympusStorage.updateIndexOrderToken(_orderId, tokenIndex, _totalTokenAmount, _actualPrice, _completedQuantity, status);

        return true;
    }

    function updateOrderStatus(uint _orderId, STD.OrderStatus _status)
        external allowProviderOnly(TD.ProviderType.Exchange)
        returns (bool success)
    {
        olympusStorage.updateOrderStatus(_orderId, _status);

        return true;
    }

    function getSubOrderStatus(uint _orderId, address _tokenAddress)
        external view returns (ExchangeAdapterBase.OrderStatus)
    {
        return exchangeProvider.getSubOrderStatus(_orderId, ERC20(_tokenAddress));
    }

    function adjustFee(uint _newFeePercentage) public onlyOwner returns (bool success) {
        require(_newFeePercentage < DENOMINATOR);
        feePercentage = _newFeePercentage;
        return true;
    }

    function adjustMOTFeeDiscount(uint _newDiscountPercentage) public onlyOwner returns(bool success) {
        require(_newDiscountPercentage <= 100);
        MOTDiscount = _newDiscountPercentage;
        return true;
    }

    function adjustTradeRange(uint _minInWei, uint _maxInWei) public onlyOwner returns (bool success) {
        require(_minInWei > 0);
        require(_maxInWei > _minInWei);
        minimumInWei = _minInWei;
        maximumInWei = _maxInWei;

        return true;
    }

    function getFeeAmount(uint amountInWei, bool feeIsMOT) private view returns (uint){
        if(feeIsMOT){
            return ((amountInWei * feePercentage / DENOMINATOR) * (100 - MOTDiscount)) / 100;
        } else {
            return amountInWei * feePercentage / DENOMINATOR;
        }
    }

    function payFee(uint totalValue, uint feeValueInETH, address sender, bool feeIsMOT) private returns (uint){
        if(feeIsMOT){
            // Transfer MOT
            uint MOTPrice;
            uint allowance = MOT.allowance(sender,address(this));
            (MOTPrice,) = priceProvider.getRates(address(MOT), feeValueInETH);
            uint amount = (feeValueInETH * MOTPrice) / 10**18;
            require(allowance >= amount);
            require(MOT.transferFrom(sender,address(this),amount));
            return totalValue; // Use all sent ETH to buy, because fee is paid in MOT
        } else { // We use ETH as fee, so deduct that from the amount of ETH sent
            return totalValue - feeValueInETH;
        }
    }

    function withdrawERC20(address receiveAddress,address _tokenAddress) public onlyOwner returns(bool success)
    {
        uint _balance = ERC20(_tokenAddress).balanceOf(address(this));
        require(_tokenAddress != 0x0 && receiveAddress != 0x0 && _balance != 0);
        require(ERC20(_tokenAddress).transfer(receiveAddress,_balance));
        return true;
    }

    function withdrawETH(address receiveAddress) public onlyOwner returns(bool success)
    {
        require(receiveAddress != 0x0);
        receiveAddress.transfer(address(this).balance);
        return true;
    }

    function buyToken(bytes32 exchangeId, ERC20[] tokens, uint[] amounts, uint[] rates, address deposit) public payable returns (bool success) {
        require(exchangeProvider.buyToken.value(msg.value)(exchangeId, tokens, amounts, rates, deposit));
        return true;
    }

    function sellToken(bytes32 exchangeId, ERC20[] tokens, uint[] amounts, uint[] rates, address deposit) public returns (bool success) {
        for (uint i = 0; i < tokens.length; i++) {

            tokens[i].transferFrom(msg.sender, address(exchangeProvider), amounts[i]);
        }
        require(exchangeProvider.sellToken(exchangeId, tokens, amounts, rates, deposit));
        return true;
    }

    function fundSellToken(bytes32 exchangeId, address fundAddress, ERC20[] tokens, uint[] amounts, uint[] rates, address deposit) public returns (bool success) {
        require(FundTemplate(fundAddress).sellToken(exchangeId, tokens, amounts, rates, deposit));
        return true;
    }
    function fundBuyToken(bytes32 exchangeId, uint ethAmount, ERC20[] tokens, uint[] amounts, uint[] rates, address fundAddress) public returns (bool success) {

        require(FundTemplate(fundAddress).buyToken(exchangeId, ethAmount, tokens, amounts, rates, fundAddress));
        require(FundTemplate(fundAddress).updateTokens(tokens));
        return true;
    }

    function addTokenization(address token, uint8 tokenType) public allowTokenizationOnly returns (bool success) {
        olympusStorage.addTokenization(token, tokenType);
        return true;
    }
}
