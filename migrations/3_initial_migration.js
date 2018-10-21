var Olympus = artifacts.require("./OlympusFund");

module.exports = function (deployer) {
  deployer.deploy(Olympus, 10000000000, 'NFTS Token',18,'NFTS');
};
