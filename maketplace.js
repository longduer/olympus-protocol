var Web3= require("web3"); //添加以太坊web3.js支持
var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象


//本地Ganache节点支持
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var web3 = new Web3(provider);

//源MetaCoin合约
var Registery = contract(require("./build/contracts/Marketplace.json"));
Registery.setProvider(provider);//合约提供注册
Registery.setNetwork('*');//rpcport


/**
 * 当前合约存在的问题：
 * 1：只有合约的创建者才能进行transfer方法，否则报：unknown account,搞不懂哦，这个合约可能只是一个测试合约,没考虑完整性，因为负数也是可以mint的
 */


var accounts = web3.eth.accounts;
console.log(accounts);

var gasPrice = web3.eth.gasPrice;
console.log(web3.fromWei(gasPrice.toString(10),'gwei')); // "10000000000000"

var balance = web3.eth.getBalance(accounts[0]);
console.log(web3.fromWei(balance.toNumber(),'ether')); // 1000000000000

Registery.deployed().then(async(instance) => {

  var result = await instance.getOwnProducts({from: accounts[0]});

  console.info(result);
}).catch(function (e) {
    console.info(e);
});
