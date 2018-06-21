pragma solidity 0.4.24;


import "../../interfaces/ChargeableInterface.sol";
import "../../interfaces/DerivativeInterface.sol";

contract PercentageFee is ChargeableInterface {

    mapping(address => mapping(address => uint)) fees; // owner => contract => fee value

    constructor () public {
        name = "PercentageFee";
        description = "Calculates the fee as percentage";
        category = "Fee";
        version = "1.0";
        DENOMINATOR = 100000;
    }

    function setFeePercentage(uint _fee) external returns(bool success) {
        require(_fee >= 0);
        require(_fee < DENOMINATOR);

        DerivativeInterface derivative = DerivativeInterface(msg.sender);
        fees[derivative.owner()][msg.sender] = _fee;
        return true;
    }

    function getFeePercentage() external view returns (uint) {
        return fees[DerivativeInterface(msg.sender).owner()][msg.sender];
    }

    function calculateFee(address /*_caller*/,  uint _amount)  external returns(uint) {
        DerivativeInterface derivative = DerivativeInterface(msg.sender);
        if(fees[derivative.owner()][msg.sender] == 0) {
            return 0;
        }

        uint _fee = _amount * fees[derivative.owner()][msg.sender]/DENOMINATOR;
        return _fee;
    }


}
