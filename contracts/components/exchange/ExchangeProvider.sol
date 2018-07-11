pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../../libs/ERC20NoReturn.sol";
import "../../interfaces/implementations/OlympusExchangeAdapterManagerInterface.sol";
import "../../interfaces/implementations/OlympusExchangeAdapterInterface.sol";
import "../../interfaces/implementations/OlympusExchangeInterface.sol";
import "../../libs/utils.sol";
import "../../components/base/FeeCharger.sol";

contract ExchangeProvider is FeeCharger, OlympusExchangeInterface {
    using SafeMath for uint256;
    string public name = "OlympusExchangeProvider";
    string public description =
    "Exchange provider of Olympus Labs, which additionally supports buy\and sellTokens for multiple tokens at the same time";
    string public category = "exchange";
    string public version = "v1.0";
    ERC20Extended private constant ETH  = ERC20Extended(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    OlympusExchangeAdapterManagerInterface private exchangeAdapterManager;

    constructor(address _exchangeManager) public {
        exchangeAdapterManager = OlympusExchangeAdapterManagerInterface(_exchangeManager);
        feeMode = FeeMode.ByTransactionAmount;
    }

    modifier checkAllowance(ERC20Extended _token, uint _amount) {
        require(_token.allowance(msg.sender, address(this)) >= _amount, "Not enough tokens approved");
        _;
    }

    function setExchangeAdapterManager(address _exchangeManager) external onlyOwner {
        exchangeAdapterManager = OlympusExchangeAdapterManagerInterface(_exchangeManager);
    }

    function buyToken
        (
        ERC20Extended _token, uint _amount, uint _minimumRate,
        address _depositAddress, bytes32 _exchangeId, address /* _partnerId */
        ) external payable returns(bool success) {

        require(msg.value == _amount);

        OlympusExchangeAdapterInterface adapter;
        // solhint-disable-next-line
        bytes32 exchangeId = _exchangeId == "" ? exchangeAdapterManager.pickExchange(_token, _amount, _minimumRate, true) : _exchangeId;
        if(exchangeId == 0){
            revert("No suitable exchange found");
        }

        require(payFee(msg.value * getMotPrice() / 10 ** 18));
        adapter = OlympusExchangeAdapterInterface(exchangeAdapterManager.getExchangeAdapter(exchangeId));
        require(
            adapter.buyToken.value(msg.value)(
                _token,
                _amount,
                _minimumRate,
                _depositAddress)
        );
        return true;
    }

    function sellToken
        (
        ERC20Extended _token, uint _amount, uint _minimumRate,
        address _depositAddress, bytes32 _exchangeId, address /* _partnerId */
        ) checkAllowance(_token, _amount) external returns(bool success) {

        OlympusExchangeAdapterInterface adapter;
        bytes32 exchangeId = _exchangeId == "" ? exchangeAdapterManager.pickExchange(_token, _amount, _minimumRate, false) : _exchangeId;
        if(exchangeId == 0){
            revert("No suitable exchange found");
        }

        uint tokenPrice;
        (tokenPrice,) = exchangeAdapterManager.getPrice(_token, ETH, _amount, exchangeId);
        require(payFee(tokenPrice  * _amount * getMotPrice() / 10 ** _token.decimals() / 10 ** 18));

        adapter = OlympusExchangeAdapterInterface(exchangeAdapterManager.getExchangeAdapter(exchangeId));

        ERC20NoReturn(_token).transferFrom(msg.sender, address(adapter), _amount);

        require(
            adapter.sellToken(
                _token,
                _amount,
                _minimumRate,
                _depositAddress)
            );
        return true;
    }

    function getMotPrice() private view returns (uint price) {
        (price,) = exchangeAdapterManager.getPrice(ETH, MOT, 10**18, 0x0);
    }

    function buyTokens
        (
        ERC20Extended[] _tokens, uint[] _amounts, uint[] _minimumRates,
        address _depositAddress, bytes32 _exchangeId, address /* _partnerId */
        ) external payable returns(bool success) {
        require(_tokens.length == _amounts.length && _amounts.length == _minimumRates.length, "Arrays are not the same lengths");
        require(payFee(msg.value * getMotPrice() / 10 ** 18));
        uint totalValue;
        uint i;
        for(i = 0; i < _amounts.length; i++ ) {
            totalValue += _amounts[i];
        }
        require(totalValue == msg.value, "msg.value is not the same as total value");

        for (i = 0; i < _tokens.length; i++ ) {
            bytes32 exchangeId = _exchangeId == "" ?
            exchangeAdapterManager.pickExchange(_tokens[i], _amounts[i], _minimumRates[i], true) : _exchangeId;
            if (exchangeId == 0) {
                revert("No suitable exchange found");
            }
            require(
                OlympusExchangeAdapterInterface(exchangeAdapterManager.getExchangeAdapter(exchangeId)).buyToken.value(_amounts[i])(
                    _tokens[i],
                    _amounts[i],
                    _minimumRates[i],
                    _depositAddress)
            );
        }
        return true;
    }

    function sellTokens
        (
        ERC20Extended[] _tokens, uint[] _amounts, uint[] _minimumRates,
        address _depositAddress, bytes32 _exchangeId, address /* _partnerId */
        ) external returns(bool success) {
        require(_tokens.length == _amounts.length && _amounts.length == _minimumRates.length, "Arrays are not the same lengths");
        OlympusExchangeAdapterInterface adapter;

        uint[] memory prices = new uint[](3); // 0 tokenPrice, 1 MOT price, 3 totalValueInMOT
        for (uint i = 0; i < _tokens.length; i++ ) {
            bytes32 exchangeId = _exchangeId == bytes32("") ?
            exchangeAdapterManager.pickExchange(_tokens[i], _amounts[i], _minimumRates[i], false) : _exchangeId;
            if(exchangeId == 0){
                revert("No suitable exchange found");
            }

            (prices[0],) = exchangeAdapterManager.getPrice(_tokens[i], ETH, _amounts[i], exchangeId);
            prices[1] = getMotPrice();
            prices[2] += prices[0] * _amounts[i] * prices[1] / 10 ** _tokens[i].decimals() / 10 ** 18;

            adapter = OlympusExchangeAdapterInterface(exchangeAdapterManager.getExchangeAdapter(exchangeId));
            require(_tokens[i].allowance(msg.sender, address(this)) >= _amounts[i], "Not enough tokens approved");
            ERC20NoReturn(_tokens[i]).transferFrom(msg.sender, address(adapter), _amounts[i]);
            require(
                adapter.sellToken(
                    _tokens[i],
                    _amounts[i],
                    _minimumRates[i],
                    _depositAddress)
            );
        }

        require(payFee(prices[2]));

        return true;
    }

    function supportsTradingPair(address _srcAddress, address _destAddress, bytes32 _exchangeId) external view returns (bool){
        return exchangeAdapterManager.supportsTradingPair(_srcAddress, _destAddress, _exchangeId);
    }

    function getPrice(ERC20Extended _sourceAddress, ERC20Extended _destAddress, uint _amount, bytes32 _exchangeId)
        external view returns(uint expectedRate, uint slippageRate) {
        return exchangeAdapterManager.getPrice(_sourceAddress, _destAddress, _amount, _exchangeId);
    }
}
