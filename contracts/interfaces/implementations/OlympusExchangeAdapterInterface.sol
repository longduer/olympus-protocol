pragma solidity 0.4.24;

import "../../libs/utils.sol";
import "../ExchangeInterface.sol";
import "./KyberNetworkInterface.sol";
import "../../libs/Ownable.sol";


contract OlympusExchangeAdapterInterface is Ownable {

    function supportsTradingPair(address _srcAddress, address _destAddress)
        external view returns(bool supported);

    function getPrice(ERC20 _sourceAddress, ERC20 _destAddress, uint _amount)
        external view returns(uint expectedRate, uint slippageRate);

    function sellToken
        (
        ERC20 _token, uint _amount, uint _minimumRate,
        address _depositAddress, address _partnerId
        ) external returns(bool success);

    function buyToken
        (
        ERC20 _token, uint _amount, uint _minimumRate,
        address _depositAddress, address _partnerId
        ) external payable returns(bool success);

    function enable() external returns(bool);
    function disable() external returns(bool);
    function isEnabled() external view returns (bool success);

    function configAdapter(KyberNetworkInterface _kyber, address _walletId) external returns(bool success);
    function setExchangeDetails(bytes32 _id, bytes32 _name) external returns(bool success);
    function getExchangeDetails() external view returns(bytes32 _name, bool _enabled);

}
