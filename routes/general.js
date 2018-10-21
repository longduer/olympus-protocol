var express = require('express');

var router = express.Router();


router.get('/info', (req, res, next) => {

  var Web3= require("web3"); //添加以太坊web3.js支持
  var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象


  //本地Ganache节点支持
  var provider = new Web3.providers.HttpProvider("http://localhost:7545");
  web3 = new Web3(provider);
  var accounts = web3.eth.accounts;
  //源MetaCoin合约
  var Registery = contract(require("../build/contracts/OlympusBasicFund.json"));
  var Registery_Token = contract(require("../build/contracts/OlympusFund.json"));
  Registery.setProvider(provider);//合约提供注册
  Registery.setNetwork('*');//rpcport
  Registery_Token.setProvider(provider);//合约提供注册
  Registery_Token.setNetwork('*');//rpcport
  var tokenBalance = 0 ;
  Registery_Token.deployed().then(async (instance) => {
    tokenBalance =  await instance.balanceOf(accounts[1]);
    console.info("tokenBalance" + tokenBalance);
  }).then(function (result) {
    console.info('result:' + result);
  });

  Registery.deployed().then( async (instance) => {
    // console.info();
    var symbol = await instance.symbol();
    var name = await instance.name();
    // var category = await instance.category();
    var description = await instance.description();
    // var version = await instance.version();
    var decimals = await instance.decimals();
    var status = await instance.status();
    var fundType = await instance.fundType();
    var tokens = await instance.getTokens();
    console.info(tokens);
    console.log(symbol, name);
    var fromAddressBalance = web3.fromWei(web3.eth.getBalance(accounts[1]),'ether');
    console.info("Balance: " + fromAddressBalance);

    return {
      name: name,
      symbol: symbol,
      // category:category,
      description:description,
      // version:version,
      decimals:decimals,
      status:status,
      fundType:fundType,
      ethBalance:fromAddressBalance,
      tokenBalance:web3.fromWei(tokenBalance,'ether'),
      accounts:accounts
    };
  }).then(function (result) {
    res.json(result);
  }).catch(function (e) {
    console.info(e);
  });
});

module.exports = router;
