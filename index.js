var Web3= require("web3"); //添加以太坊web3.js支持
var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象

//本地Ganache节点支持
var provider = new Web3.providers.HttpProvider("http://localhost:7545");
web3 = new Web3(provider);

var Registery = contract(require("./build/contracts/OlympusBasicFund.json"));
Registery.setProvider(provider);//合约提供注册
Registery.setNetwork('*');//rpcport

Registery.deployed().then( async (instance) => {
  var symbol = await instance.symbol();
  var name = await instance.name();
  var description = await instance.description();
  var decimals = await instance.decimals();
  var status = await instance.status();
  var fundType = await instance.fundType();
  return {
    name: name, symbol: symbol, description:description,
    decimals:decimals, status:status, fundType:fundType
  };
}).then(function (result) {console.info('result:' + JSON.stringify(result));});
