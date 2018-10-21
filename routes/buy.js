var express = require('express');
var Web3 = require("web3"); //引入web3支持，我本地使用的是web3^0.18.4
var ethereumjsWallet = require('ethereumjs-wallet'); //引入以太坊nodejs操作钱包支持
var Tx = require("ethereumjs-tx"); //引入以太坊js交易支持
var router = express.Router();
var contract = require("truffle-contract"); //对node或浏览器端来说，更佳的以太坊合约抽象



//初始化web3
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  //我本地的私有链信息
  //启用命令：> geth --networkid 1108 --nodiscover --datadir ./ --rpc --rpcapi net,eth,web3,personal --rpcaddr 127.0.0.1 --rpcport 8545 console
  web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
}
var provider = new Web3.providers.HttpProvider("http://localhost:7545");
//源MetaCoin合约
var Registery = contract(require("../build/contracts/OlympusFund.json"));
Registery.setProvider(provider);//合约提供注册
Registery.setNetwork('*');//rpcport
var web3 = new Web3(provider);


router.get('/', function(req, res, next){
  var from = 1;
  var value = 1;
  if (req.query.index) {
    from = parseInt(req.query.from);
  }
  if (req.query.value) {
    value = parseInt(req.query.value);
  }

  Registery.deployed().then( async (instance) => {
    var accounts = web3.eth.accounts;
    var to = accounts[0];
    var priateKeys = [
      "094a658c4bb573b9cbb0df65eecde81361509b2470c5904bf6bd218423560da2",
      "977f0329a2abc97b77182dc43fa83555f4fa8af9b087279f1482e7d00dbca89f"
    ];
    var privateKey = new Buffer(priateKeys[from].toString(), 'hex');
    var wallet = ethereumjsWallet.fromPrivateKey(privateKey);
    var privateKey = wallet.getPrivateKey();
    //打印当前钱包privateKey
    var fromAddress = wallet.getAddress().toString("hex");
    //返回指定地址发起的交易数
    var number = web3.eth.getTransactionCount("0x" + fromAddress);

    //通过交易参数
    var rawTx = {
      nonce: number,//交易数
      gasPrice: '0x3b9aca00',//gas价格
      gasLimit: '0x3d0900',
      to: accounts[0],//转账到哪个账户
      value: web3.toHex(web3.toWei(value,'ether')),//以太币数量
      data: ''
    };

    //构造此交易对象
    var tx = new Tx(rawTx);
    //发起人私钥签名
    tx.sign(privateKey);
    //交易序列化
    var serializedTx = tx.serialize();
    //执行交易
    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
      console.log('transaction id ：'+hash);
    });
    return instance.transfer(accounts[1], web3.toWei(value*100,'ether'),{from:accounts[0]});

  }).then(function (result) {
    res.json(result);
  }).catch(function (e) {
    console.info(e);
  });
});

module.exports = router;
