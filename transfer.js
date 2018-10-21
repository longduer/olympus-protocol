var Web3= require("web3"); //添加以太坊web3.js支持
var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象


//本地Ganache节点支持
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
//源MetaCoin合约
var Registery = contract(require("./build/contracts/OlympusFund.json"));
Registery.setProvider(provider);//合约提供注册
Registery.setNetwork('*');//rpcport
var web3 = new Web3(provider);


var accounts = web3.eth.accounts;
var from = accounts[0];
var to = accounts[1];
var contractI;
Registery.deployed().then(function (instance) {
  contractI = instance;
  return contractI.transfer(to,web3.toWei(1,'ether'),{from:from});
}).then(function (result) {
  console.info(JSON.stringify(result));
  return contractI.balanceOf(from);
}).then(function (result) {
  console.info(result);
}).catch(function (e) {
  console.info(e);
});
