pragma solidity ^0.4.19;
// pragma experimental ABIEncoderV2;

import "./OlympusLabsCore.sol";


contract Test {
    using SafeMath for uint256;

    OlympusLabsCore public core;
    uint strategyId = 2;

    function Test()  public {
        core = new OlympusLabsCore();
    }

    function() public payable {
        core.buyIndex.value(msg.value)(strategyId, msg.sender);
    }

    function setStrategyId(uint _strategyId) public returns(bool)
    {
        strategyId = _strategyId;
    }
}
