var Web3 = require("web3"); //引入web3支持，我本地使用的是web3^0.18.4
var ethereumjsWallet = require('ethereumjs-wallet'); //引入以太坊nodejs操作钱包支持
var Tx = require("ethereumjs-tx"); //引入以太坊js交易支持


//初始化web3
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    //我本地的私有链信息
    //启用命令：> geth --networkid 1108 --nodiscover --datadir ./ --rpc --rpcapi net,eth,web3,personal --rpcaddr 127.0.0.1 --rpcport 8545 console
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
}
var privateKey = new Buffer('a79106695cc95e26d88c807aeb02ac3229bc621b1919c95e7340af3b3945623c', 'hex')

var wallet = ethereumjsWallet.fromPrivateKey(privateKey);
var privateKey = wallet.getPrivateKey();
//打印当前钱包privateKey
console.info("private key : " + privateKey.toString("hex"));

var fromAddress = wallet.getAddress().toString("hex");
var toAddress = "0x0018e365ff95284f2f70267d7c570a93da17e7dc";
console.info("Address: " + fromAddress);
var fromAddressBalance = web3.fromWei(web3.eth.getBalance(fromAddress),'ether');
console.info("Balance: " + fromAddressBalance);

//返回指定地址发起的交易数
var number = web3.eth.getTransactionCount("0x" + fromAddress);
//console.info("address: "+fromAddress+ " has " +number + " transactions in total");


var gasPrice = web3.eth.gasPrice.toString(10);
//console.log("gasPrice: " + gasPrice.toString(10)); // "10000000000000"

var gasPrice = web3.toWei(1,'gwei');

//通过交易参数
var rawTx = {
    nonce: number,//交易数
    gasPrice: '0x3b9aca00',//gas价格
    gasLimit: '0x3d0900',
    to: toAddress,//转账到哪个账户
    value: web3.toHex(web3.toWei(1,'ether')),//以太币数量
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
