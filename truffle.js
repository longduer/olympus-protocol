var HDWalletProvider = require("truffle-hdwallet-provider");
var prompt = require('prompt-sync')();

var mnemonics = {};

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      // gas: 7600000
    }
  },
  // mocha: {
  //   reporter: 'eth-gas-reporter',
  //   reporterOptions : {
  //     currency: 'EUR',
  //     gasPrice: 2
  //   }
  // },
  kovan: {
    provider: function () {
      mnemonics.kovan = process.env.MNEMONICS || mnemonics.kovan || prompt('network kovan mnemonic: ');
      return new HDWalletProvider(mnemonics.kovan, "https://kovan.infura.io/qajYHKaGssZt5WrdfzGP");
    },
    gasPrice: 1000000000,
    network_id: 3
  }
}