'use strict'
/*
contract OlympusStorageInterface {
    function addTokenDetails(
        uint indexOrderId, address token, uint weight, uint estimatedPrice,
        uint dealtPrice,uint totalTokenAmount,uint completedTokenAmount) external;
    function addOrderBasicFields(
        uint strategyId,
        address buyer,
        uint amountInWei,
        uint feeInWei,
        bytes32 exchangeId) external returns (uint indexOrderId);
    function getOrderTokenCompletedAmount(
        uint _orderId,
        address _tokenAddress) external view returns (uint, uint);
    function getIndexOrder1(uint _orderId) external view returns(
        uint strategyId,
        address buyer,
        STD.OrderStatus status,
        uint dateCreated
        );
    function getIndexOrder2(uint _orderId) external view returns(
        uint dateCompleted,
        uint amountInWei,
        uint tokensLength,
        bytes32 exchangeId
        );
    function updateIndexOrderToken(
        uint _orderId,
        uint _tokenIndex,
        uint _actualPrice,
        uint _totalTokenAmount,
        uint _completedQuantity,
        ExchangeProviderInterface.MarketOrderStatus status) external;
    function getIndexToken(uint _orderId, uint tokenPosition) external view returns (address token);
    function updateOrderStatus(uint _orderId, STD.OrderStatus _status)
        external returns (bool success);
}
*/
const KyberConfig = require('../scripts/libs/kyber_config');
const OlympusStorage = artifacts.require("../contracts/storage/OlympusStorage.sol");
const Web3 = require('web3');
const web3 = new Web3();
const _ = require('lodash');
const Promise = require('bluebird');
const TX_OK = '0x01';
const mockData = {
  startOrderId: 1000000,
  buyer: '0x0000000000000000000000000000000000000000',

  strategyId: 0,
  amountInWei: 1000000,
  feeInWei: 100000,
  dateCreated: 0,
  dateCompleted: 0,
  tokens: KyberConfig.kovan.tokens,
  weights: [80, 20],
  estimatedPrices: [1, 2],
  dealtPrices: [0, 0],
  totalTokenAmounts: [10, 20],
  completedTokenAmounts: [5, 10],
  subStatuses: [0, 0],
  status: 0,
  exchangeId: 'Kyber',
  statusNew: 1,
}

contract('OlympusStorage', (accounts) => {

  it("Should be able to deploy.", () => {
    return Promise.all([
      OlympusStorage.deployed()
    ]).spread((storage) => {
      assert.ok(storage, 'OlympusStorage contract is not deployed.');
    });
  });

  it("Should be able to add order basic fields.", async () => {
    try {
      const instance = await OlympusStorage.deployed();
      const result = await instance.addOrderBasicFields.call(
        mockData.strategyId, mockData.buyer,
        mockData.amountInWei, mockData.feeInWei,
        mockData.exchangeId,
        { from: accounts[0] });
      const resultTransaction = await instance.addOrderBasicFields(
        mockData.strategyId, mockData.buyer,
        mockData.amountInWei, mockData.feeInWei,
        mockData.exchangeId,
        { from: accounts[0] });
      assert.equal(result.toNumber(), mockData.startOrderId);
      assert.equal(resultTransaction.receipt.status, TX_OK);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  it("Should be able to add order token fields.", async () => {
    try {
      const instance = await OlympusStorage.deployed();
      for (let index = 0; index < mockData.tokens.length; index++) {
        const result = await instance.addTokenDetails(
          mockData.startOrderId, mockData.tokens[index], mockData.weights[index], mockData.estimatedPrices[index],
          mockData.dealtPrices[index], mockData.totalTokenAmounts[index], mockData.completedTokenAmounts[index]);
        assert.equal(result.receipt.status, TX_OK);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  it("Should be able to get order token completed amount", async () => {
    try {
      const instance = await OlympusStorage.deployed();
      const firstResult = await instance.getOrderTokenCompletedAmount.call(mockData.startOrderId, mockData.tokens[0]);
      const secondResult = await instance.getOrderTokenCompletedAmount.call(mockData.startOrderId, mockData.tokens[1]);
      assert.equal(firstResult[0].toNumber(), mockData.completedTokenAmounts[0]);
      assert.equal(secondResult[0].toNumber(), mockData.completedTokenAmounts[1]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  it("Should be able to get order details", async () => {
    try {
      const instance = await OlympusStorage.deployed();
      const firstPart = await instance.getIndexOrder1.call(mockData.startOrderId);
      const secondPart = await instance.getIndexOrder2.call(mockData.startOrderId);
      const fullIndex = firstPart.concat(secondPart);
      assert.equal(fullIndex[0].toNumber(), mockData.strategyId);
      assert.equal(fullIndex[1], mockData.buyer);
      assert.equal(fullIndex[2].toNumber(), mockData.status);
      assert.equal(fullIndex[5].toNumber(), mockData.amountInWei);
      assert.equal(fullIndex[6].toNumber(), mockData.tokens.length);
      assert.equal(web3.toAscii(fullIndex[7]).replace(/\0/g, ''), mockData.exchangeId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  it("Should be able to update order token", async () => {
    try {
      const instance = await OlympusStorage.deployed();
      const firstTransactionResult = await instance.updateIndexOrderToken(
        mockData.startOrderId,
        0,
        mockData.estimatedPrices[0],
        mockData.totalTokenAmounts[0],
        mockData.completedTokenAmounts[0] + 5,
        0);
      const secondTransactionResult = await instance.updateIndexOrderToken(
        mockData.startOrderId,
        1,
        mockData.estimatedPrices[1],
        mockData.totalTokenAmounts[1],
        mockData.completedTokenAmounts[1] + 2,
        0);

      assert.equal(firstTransactionResult.receipt.status, TX_OK);
      assert.equal(secondTransactionResult.receipt.status, TX_OK);
      const firstResult = await instance.getOrderTokenCompletedAmount.call(mockData.startOrderId, mockData.tokens[0]);
      const secondResult = await instance.getOrderTokenCompletedAmount.call(mockData.startOrderId, mockData.tokens[1]);
      assert.equal(firstResult[0].toNumber(), mockData.completedTokenAmounts[0] + 5);
      assert.equal(secondResult[0].toNumber(), mockData.completedTokenAmounts[1] + 2);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  it("Should be able to get index token", async () => {
    try {
      const instance = await OlympusStorage.deployed();
      const firstResult = await instance.getIndexToken.call(mockData.startOrderId, 0);
      const secondResult = await instance.getIndexToken.call(mockData.startOrderId, 1);
      assert.equal(firstResult, mockData.tokens[0]);
      assert.equal(secondResult, mockData.tokens[1]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  it("Should be able to update order details", async () => {
    try {
      const instance = await OlympusStorage.deployed();
      const result = await instance.updateOrderStatus(mockData.startOrderId, mockData.statusNew);
      assert.equal(result.receipt.status, TX_OK);
      const status = (await instance.getIndexOrder1.call(mockData.startOrderId))[2].toNumber();
      assert.equal(status, mockData.statusNew);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

});
