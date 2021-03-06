"use strict";

const RiskControl = artifacts.require("RiskControl");
const MockToken = artifacts.require("MockToken");
const MockRiskControl = artifacts.require("MockRiskControl");
const Promise = require("bluebird");
const calc = require("../utils/calc");

contract("RiskControl", accounts => {
  it("RiskControl should be able to deploy.", async () => {
    return await Promise.all([RiskControl.deployed()]).spread((/*RiskControl*/ instance) => {
      assert.ok(instance, "RiskControl contract is not deployed.");
    });
  });

  it("RiskControl should be able to return false.", async () => {
    let riskControl = await RiskControl.deployed();
    let mockMot = await MockToken.new("", "MOT", calc.getRandomDecimals(), 10 ** 9 * 10 ** 18);
    await riskControl.setMotAddress(mockMot.address);
    let instance = await MockRiskControl.new(riskControl.address);
    await instance.initialize();
    let result = await instance.hasRisk.call(
      accounts[0],
      accounts[1],
      "0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      web3.toWei(1),
      10 ** 18,
      { from: accounts[0] }
    );
    assert.equal(result, false);
  });
});
