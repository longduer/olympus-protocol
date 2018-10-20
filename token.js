var Web3= require("web3"); //添加以太坊web3.js支持
var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象


//本地Ganache节点支持
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
//源MetaCoin合约
var Registery = contract(require("./build/contracts/MarmotToken.json"));
Registery.setProvider(provider);//合约提供注册
Registery.setNetwork('*');//rpcport


Registery.deployed().then(function (instance) {
  return instance.name();
}).then(function (result) {
  console.info('result:' + result);
}).then(function () {

}).catch(function (e) {
  console.info(e);
});
