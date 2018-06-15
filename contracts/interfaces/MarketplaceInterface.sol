pragma solidity ^0.4.23;

import "../libs/Ownable.sol";


contract MarketplaceInterface is Ownable {

    address[] public products;
    mapping(address => address[]) public productMappings;

    function getAllProducts() external view returns (address[] allProducts);
    function registerProduct() external returns(bool success);
    function getOwnProducts() external view returns (address[] addresses);
}
