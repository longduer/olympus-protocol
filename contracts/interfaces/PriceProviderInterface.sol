pragma solidity 0.4.24;

import "../libs/ERC20.sol";
import "./ComponentInterface.sol";


contract PriceProviderInterface is ComponentInterface {
    /*
     * @dev Returns the expected price for 1 of sourceAddress.
     * For ETH, use 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
     * @param address _sourceAddress The token to sell for the destAddress.
     * @param address _destAddress The token to buy with the source token.
     * @param uint _amount The amount of tokens which is wanted to buy.
     * @param bytes32 _exchangeId The exchangeId to choose. If it's an empty string, then the exchange will be chosen automatically.
     * @return returns the expected and slippage rate for the specified conversion
     */
    function getPrice(address _sourceAddress, address _destAddress, uint _amount, bytes32 _exchangeId)
        external returns(uint expectedRate, uint slippageRate);
}
