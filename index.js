var Web3= require("web3"); //添加以太坊web3.js支持
var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象


//本地Ganache节点支持
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
//源MetaCoin合约
var Registery = contract(require("./build/contracts/OlympusBasicFund.json"));
Registery.setProvider(provider);//合约提供注册
Registery.setNetwork('*');//rpcport


/**
 * 当前合约存在的问题：
 * 1：只有合约的创建者才能进行transfer方法，否则报：unknown account,搞不懂哦，这个合约可能只是一个测试合约,没考虑完整性，因为负数也是可以mint的
 */

Registery.deployed().then(function (instance) {
  return instance.INITIAL_VALUE();
}).then(function (result) {
    console.info('result:' + result);
}).catch(function (e) {
    console.info(e);
});
