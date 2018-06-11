'use strict'
const Reimbursable = artifacts.require("../contracts/lib/Reimbursable.sol");

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const _ = require('lodash');
const Promise = require('bluebird');
const TX_OK = '0x01';

contract("TestReimbursable", (accounts) => {
  it('Should be able to deploy', async () => {
    return await Promise.all([
      Reimbursable.deployed(),
    ]).spread((reimbursable) => {
      assert.ok(reimbursable, 'Reimbursable contract is not deployed.');
    });
  })

  it('it should reimburse the gas used.', async () => {
    let reimbursable = await Reimbursable.deployed();
    let balance = await web3.eth.getBalance(accounts[0]);
    const result = await reimbursable.send(web3.toWei(1, "ether"));
    assert.ok(result, 'Unable to send ethers to Reimbursable contract.');
    let initialBalance = await web3.eth.getBalance(accounts[0]);
    console.log("initialBalance: " + web3.fromWei(initialBalance, 'ether'));
    balance = await web3.eth.getBalance(reimbursable.address);
    assert.equal(web3.toWei(1), balance);

    let estimatedGas = await reimbursable.test.estimateGas({
      from: accounts[0], 
      to: reimbursable.address, 
      gas: 10 ** 6
    });

    console.log("gas estimation = " + estimatedGas + " units");
    const gasPrice = 1000000000;
    console.log("gas cost estimation = " + web3.fromWei(estimatedGas * gasPrice, 'Gwei') + "G wei");    
    let actualGasCosted = await reimbursable.test.call({ from: accounts[0] });
    console.log('actualGasCosted', web3.fromWei(actualGasCosted.toString(), 'Gwei'));
    let finalBalance = await web3.eth.getBalance(accounts[0]);
    console.log('finalBalance', web3.fromWei(finalBalance.toString(), 'ether'));
    console.log('Difference in Gwei', web3.fromWei(finalBalance - initialBalance), 'Gwei');
    // assert.equal(initialBalance.toNumber(), finalBalance.toNumber());
    assert.ok(initialBalance.comparedTo(finalBalance) === 0);
  })
});