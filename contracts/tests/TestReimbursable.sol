pragma solidity ^0.4.23;

import "../libs/Reimbursable.sol";

contract TestReimbursable is Reimbursable {
    // @notice Will receive any eth sent to the contract
    function () external payable {
    }    

    function someFunction() public returns(uint) {
        startGasCalculation();
        for(uint i = 0; i < 10; i ++ ){
            emit LogUint("Looping: ", i);
        }
        return reimburse();
    }
}