pragma solidity ^0.4.18;

import "../libs/Ownable.sol";
import "../libs/Provider.sol";


contract PriceProviderInterface is Provider {
    // For now, all price are ETH based.
    event PriceUpdated(uint timeUpdated);

    // To core smart contract
    function checkTokenSupported(address tokenAddress) external view returns (bool);
    function getPrice(address tokenAddress) external view returns (uint);

    // TO Oracles. msg.sender is the address of that Oracle.
    function updatePrices(address[] tokenAddresses, uint[] prices) external returns (bool success);

    // increment statistics
    // function incrementStatistics(address id, uint amountInEther) external returns (bool success);
}
