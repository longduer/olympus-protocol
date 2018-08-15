pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../../../interfaces/implementations/OlympusExchangeAdapterInterface.sol";
import "../../../interfaces/implementations/BancorConverterInterface.sol";
import "../../../libs/ERC20NoReturn.sol";
import "../../../libs/ERC20Extended.sol";


contract BancorNetworkAdapter is OlympusExchangeAdapterInterface {
    using SafeMath for uint256;

    address public exchangeAdapterManager;
    address public exchangeProvider;

    bytes32 public exchangeId;
    bytes32 public name;
    ERC20Extended public constant ETH_TOKEN_ADDRESS = ERC20Extended(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    ERC20Extended public constant bancorToken = ERC20Extended(0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C);
    ERC20Extended public constant bancorETHToken = ERC20Extended(0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315);
    mapping(address => BancorConverterInterface) public tokenToConverter;
    mapping(address => address) public tokenToRelay;

    bool public adapterEnabled;

    modifier checkArrayLengths(address[] tokenAddresses, BancorConverterInterface[] converterAddresses, address[] relayAddresses) {
        require(
            tokenAddresses.length == converterAddresses.length && relayAddresses.length == converterAddresses.length,
            "Arrays are not the same length");
        _;
    }

    modifier checkTokenSupported(address _token) {
        BancorConverterInterface bancorConverter = tokenToConverter[_token];
        require(address(bancorConverter) != 0x0, "Token not supported");
        _;
    }

    constructor (address _exchangeAdapterManager, address _exchangeProvider, address[] _tokenAddresses,
    BancorConverterInterface[] _converterAddresses, address[] _relayAddresses)
    checkArrayLengths(_tokenAddresses, _converterAddresses, _relayAddresses) public {
        updateSupportedTokenList(_tokenAddresses, _converterAddresses, _relayAddresses);
        exchangeAdapterManager = _exchangeAdapterManager;
        exchangeProvider = _exchangeProvider;
        adapterEnabled = true;
    }

    modifier onlyExchangeAdapterManager() {
        require(msg.sender == address(exchangeAdapterManager), "Transaction sender is not the adapter manager");
        _;
    }

    function setExchangeProvider(address _exchangeProvider) external onlyOwner{
        exchangeProvider = _exchangeProvider;
    }

    function updateSupportedTokenList(address[] _tokenAddresses, BancorConverterInterface[] _converterAddresses, address[] _relayAddresses)
    public onlyOwner
    checkArrayLengths(_tokenAddresses, _converterAddresses, _relayAddresses)
    returns (bool success) {
        for(uint i = 0; i < _tokenAddresses.length; i++){
            tokenToConverter[_tokenAddresses[i]] = _converterAddresses[i];
            tokenToRelay[_tokenAddresses[i]] = _relayAddresses[i];
        }
        return true;
    }

    function supportsTradingPair(address _srcAddress, address _destAddress) external view returns(bool supported){
        address _tokenAddress = ETH_TOKEN_ADDRESS == _srcAddress ? _destAddress : _srcAddress;
        BancorConverterInterface bancorConverter = tokenToConverter[_tokenAddress];
        return address(bancorConverter) != 0x0;
    }

    function getPrice(ERC20Extended _sourceAddress, ERC20Extended _destAddress, uint _amount)
    external view returns(uint expectedRate, uint slippageRate) {
        require(_amount > 0, "Can not get the price for amount zero");
        bool isBuying = _sourceAddress == ETH_TOKEN_ADDRESS;
        ERC20Extended targetToken = isBuying ? _destAddress : _sourceAddress;
        BancorConverterInterface BNTConverter = tokenToConverter[address(bancorToken)];

        uint rate;
        BancorConverterInterface targetTokenConverter = tokenToConverter[address(targetToken)];

        uint ETHToBNTRate = BNTConverter.getReturn(bancorETHToken, bancorToken, _amount);


        // Bancor is a special case, it's their token
        if (targetToken == bancorToken){
            if(isBuying) {
                rate = ETHToBNTRate.mul(10**18).div(_amount);
            } else {
                rate = BNTConverter.getReturn(bancorToken, bancorETHToken, _amount);
                rate = rate.mul(10**_sourceAddress.decimals()).div(_amount);
            }
        } else {
            if(isBuying){
                // Get amount of tokens for the amount of BNT for amount ETH
                rate = targetTokenConverter.getReturn(bancorToken, targetToken, ETHToBNTRate);
                // Convert rate to 1ETH to token or token to 1 ETH
                rate = rate.mul(10**18).div(_amount);
            } else {
                uint targetTokenToBNTRate = targetTokenConverter.getReturn(targetToken, bancorToken, 10**targetToken.decimals());
                rate = BNTConverter.getReturn(bancorToken, bancorETHToken, targetTokenToBNTRate);
                // Convert rate to 1ETH to token or token to 1 ETH
                rate = rate.mul(10**_sourceAddress.decimals()).div(_amount);
            }
        }

        // TODO slippage?
        return (rate,0);
    }

    // https://support.bancor.network/hc/en-us/articles/360000878832-How-to-use-the-quickConvert-function
    function getPath(ERC20Extended _token, bool isBuying) public view returns(ERC20Extended[] tokenPath, uint resultPathLength) {
        BancorConverterInterface bancorConverter = tokenToConverter[_token];
        uint pathLength;
        ERC20Extended[] memory path;

        // When buying, we can get the path from Bancor easily, by getting the quickBuyPath from the converter address
        if(isBuying){
            pathLength = bancorConverter.getQuickBuyPathLength();
            require(pathLength > 0, "Error with pathLength");
            path = new ERC20Extended[](pathLength);

            for (uint i = 0; i < pathLength; i++) {
                path[i] = bancorConverter.quickBuyPath(i);
            }
            return (path, pathLength);
        }

        // When selling, we need to make the path ourselves

        address relayAddress = tokenToRelay[_token];

        if(relayAddress == 0x0){
            // Bancor is a special case, it's their token
            if(_token == bancorToken){
                path = new ERC20Extended[](3);
                path[0] = _token;
                path[1] = _token;
                path[2] = bancorETHToken;
                return (path, 3);
            }
            // It's a Bancor smart token, handle it accordingly
            path = new ERC20Extended[](5);
            path[0] = _token;
            path[1] = _token;
            path[2] = bancorToken;
            path[3] = bancorToken;
            path[4] = bancorETHToken;
            return (path, 5);
        }

        // It's a relay token, handle it accordingly
        path = new ERC20Extended[](5);
        path[0] = _token;                              // ERC20 Token to sell
        path[1] = ERC20Extended(relayAddress);         // Relay address (automatically converted to converter address)
        path[2] = bancorToken;                         // BNT Smart token address, as converter
        path[3] = bancorToken;                         // BNT Smart token address, as "to" and "from" token
        path[4] = bancorETHToken;                      // The Bancor ETH token, this will signal we want our return in ETH

        return (path, 5);
    }

    // In contrast to Kyber, Bancor uses a minimum return for the complete trade, instead of a minimum rate for 1 ETH (for buying) or token (when selling)
    function convertMinimumRateToMinimumReturn(ERC20Extended _token, uint _minimumRate, uint _amount, bool isBuying)
    private view returns(uint minimumReturn) {
        if(_minimumRate == 0){
            return 1;
        }

        if(isBuying){
            return _amount.mul(10**18).div(_minimumRate);
        }

        return _amount.mul(10**_token.decimals()).div(_minimumRate);
    }

    function sellToken
    (
        ERC20Extended _token, uint _amount, uint _minimumRate,
        address _depositAddress
    ) external returns(bool success) {
        require(address(tokenToConverter[_token]) != 0x0, "Token not supported");
        require(_token.balanceOf(address(this)) >= _amount, "Balance of token is not sufficient in adapter");
        ERC20Extended[] memory internalPath;
        ERC20Extended[] memory path;
        uint pathLength;
        (internalPath,pathLength) = getPath(_token, false);

        path = new ERC20Extended[](pathLength);
        for(uint i = 0; i < pathLength; i++) {
            path[i] = internalPath[i];
        }

        BancorConverterInterface bancorConverter = tokenToConverter[_token];

        ERC20NoReturn(_token).approve(address(bancorConverter), 0);
        ERC20NoReturn(_token).approve(address(bancorConverter), _amount);
        uint minimumReturn = convertMinimumRateToMinimumReturn(_token,_minimumRate,_amount,false);
        uint returnedAmountOfETH = bancorConverter.quickConvert.value(0)(path,_amount,minimumReturn);
        require(returnedAmountOfETH > 0, "BancorConverter did not return any ETH");
        address(_depositAddress).transfer(returnedAmountOfETH);
        return true;
    }

    function buyToken (
        ERC20Extended _token, uint _amount, uint _minimumRate,
        address _depositAddress
    ) external payable checkTokenSupported(_token) returns(bool success){
        require(msg.value == _amount, "Amount of Ether sent is not the same as the amount parameter");
        ERC20Extended[] memory internalPath;
        ERC20Extended[] memory path;
        uint pathLength;
        (internalPath,pathLength) = getPath(_token, true);
        path = new ERC20Extended[](pathLength);
        for(uint i = 0; i < pathLength; i++) {
            path[i] = internalPath[i];
        }

        uint minimumReturn = convertMinimumRateToMinimumReturn(_token,_minimumRate,_amount,true);
        uint returnedAmountOfTokens = tokenToConverter[address(_token)].quickConvert.value(_amount)(path,_amount,minimumReturn);
        require(returnedAmountOfTokens > 0, "BancorConverter did not return any tokens");
        ERC20NoReturn(_token).transfer(_depositAddress, returnedAmountOfTokens);
        return true;
    }

    function enable() external onlyOwner returns(bool){
        adapterEnabled = true;
        return true;
    }

    function disable() external onlyOwner returns(bool){
        adapterEnabled = false;
        return true;
    }

    function isEnabled() external view returns (bool success) {
        return adapterEnabled;
    }

    function setExchangeAdapterManager(address _exchangeAdapterManager) external onlyOwner {
        exchangeAdapterManager = _exchangeAdapterManager;
    }

    function setExchangeDetails(bytes32 _id, bytes32 _name)
    external onlyExchangeAdapterManager returns(bool)
    {
        exchangeId = _id;
        name = _name;
        return true;
    }

    function getExchangeDetails()
    external view returns(bytes32 _name, bool _enabled)
    {
        return (name, adapterEnabled);
    }

    function approveToken(ERC20Extended _token) external returns(bool success){
        ERC20NoReturn(_token).approve(exchangeProvider,0);
        ERC20NoReturn(_token).approve(exchangeProvider,2**255);
        return true;
    }
}
