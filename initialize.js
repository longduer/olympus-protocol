var Web3= require("web3"); //添加以太坊web3.js支持
var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象


//本地Ganache节点支持
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var web3 = new Web3(provider);

//源MetaCoin合约
var Registery = contract(require("./build/contracts/OlympusBasicFund.json"));
Registery.setProvider(provider);//合约提供注册
Registery.setNetwork('*');//rpcport


/**
 * 当前合约存在的问题：
 * 1：只有合约的创建者才能进行transfer方法，否则报：unknown account,搞不懂哦，这个合约可能只是一个测试合约,没考虑完整性，因为负数也是可以mint的
 */

const _componentList = "0x082b06ed2b8713893ced23494bf3a781aae95721";
const _initialFundFee = "0x62E2E857967dE01574559e6bc6584F0AAc085bd1";
const _withdrawFrequency = 5; // 5 seconds
const initialBalance = 1 ** 17;

var accounts = web3.eth.accounts;
console.log(accounts);

var gasPrice = web3.eth.gasPrice;
console.log(web3.fromWei(gasPrice.toString(10),'gwei')); // "10000000000000"

var balance = web3.eth.getBalance(accounts[0]);
console.log(balance.toNumber()); // 1000000000000

Registery.deployed().then(function (instance) {
  // return instance.initialize(_componentList,{from:"0xb3a89b5c49be6acddcb8e97354e198e31b51eb46",gas:4000000});
  return instance.invest({value: 100000, from: accounts[0]});
  // return instance.initialize(_componentList, {from:accounts[0],gas:1000000,gasPrice:web3.toWei(5,'gwei')});
}).then(function (result) {
    console.info(result);
}).catch(function (e) {
    console.info(e);
});
