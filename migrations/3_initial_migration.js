var MarmotToken = artifacts.require("./MarmotToken");

module.exports = function (deployer) {
  deployer.deploy(MarmotToken,21000000,'MMM Token',18,'MMM');
};
