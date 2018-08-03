"use strict";

const KyberConfig = require("../scripts/libs/kyber_config");

let ExchangeProvider = artifacts.require("ExchangeProvider");
let ExchangeAdapterManager = artifacts.require("ExchangeAdapterManager");
let KyberNetworkAdapter = artifacts.require("../contracts/components/exchange/exchanges/KyberNetworkAdapter.sol");
let MockKyberNetwork = artifacts.require("MockKyberNetwork");

let MarketplaceProvider = artifacts.require("Marketplace");
let AsyncWithdraw = artifacts.require("AsyncWithdraw");
let Locker = artifacts.require("Locker");
let SimpleWithdraw = artifacts.require("SimpleWithdraw");
let Reimbursable = artifacts.require("Reimbursable");

let PercentageFee = artifacts.require("PercentageFee");
let ComponentList = artifacts.require("ComponentList");

const Args = require("../scripts/libs/args");
let RiskControl = artifacts.require("RiskControl");
let WhitelistProvider = artifacts.require("WhitelistProvider");

let MockToken = artifacts.require("MockToken");
let mockTokenSupply =  10 ** 9 * 10 ** 18;
let RebalanceProvider = artifacts.require("RebalanceProvider");

let StepProvider = artifacts.require("StepProvider");

let devTokens;

function deployMarketplace(deployer, network) {
  deployer.deploy([MarketplaceProvider]);
}

function deployWithdraw(deployer, network) {
  deployer.deploy([AsyncWithdraw, SimpleWithdraw]);
}

function deployWhitelist(deployer, network) {
  deployer.deploy([WhitelistProvider]);
}
function deployStep(deployer, network) {
  const MockStepContract = artifacts.require("MockStepContract");
  deployer.deploy([StepProvider, MockStepContract]);
}

function deployExchange(deployer, network) {
  let kyberNetwork = KyberConfig[network];
  let kyberAddress =
    network === "kovan" ? "0x65B1FaAD1b4d331Fd0ea2a50D5Be2c20abE42E50" : "0xD2D21FdeF0D054D2864ce328cc56D1238d6b239e";
  return deployer
    .then(() => deployer.deploy(ExchangeAdapterManager))
    .then(() => {
      if (network === "development") {
        return deployer.deploy(MockToken, "", "MOT", 18, mockTokenSupply);
      }
    })
    .then(() => deployer.deploy(KyberNetworkAdapter, kyberAddress, ExchangeAdapterManager.address))
    .then(() => deployer.deploy(ExchangeProvider, ExchangeAdapterManager.address))
    .then(() => {
      if (network === "development") {
        return deployer.deploy(MockKyberNetwork, kyberNetwork.mockTokenNum, 18);
      }
    })
    .then(async () => {
      let kyberNetworkAdapter = await KyberNetworkAdapter.deployed();
      let exchangeAdapterManager = await ExchangeAdapterManager.deployed();

      if (network === "development") {
        let mockKyberNetwork = await MockKyberNetwork.deployed();
        devTokens = await mockKyberNetwork.supportedTokens();
        await kyberNetworkAdapter.configAdapter(mockKyberNetwork.address, 0x0);
        const mot = await MockToken.deployed();
         // Send MOT for mock kyber so can trade it
        mot.transfer(mockKyberNetwork.address, mockTokenSupply /2 );
      }
      await exchangeAdapterManager.addExchange("kyber", kyberNetworkAdapter.address);
      return deployer;
    });
}

async function deployMockfund(deployer, network) {
  deployer.deploy([
    SimpleWithdraw // Exchannge Provider
  ]);
  await deployExchange(deployer, network);
}

async function deployReimbursable(deployer, network) {
  deployer.deploy([Reimbursable]);
}
async function deployLocker(deployer, network) {
  deployer.deploy([Locker]);
}

async function deployOlympusFund(deployer, network) {
  const args = Args.parseArgs();
  await deployer.deploy([
    AsyncWithdraw,
    Locker,
    RiskControl,
    MarketplaceProvider,
    PercentageFee,
    Reimbursable,
    WhitelistProvider,
    ComponentList,
    Steps
  ]);
  await deployExchange(deployer, network);
}

async function deployOlympusBasicFund(deployer, network) {
  const args = Args.parseArgs();
  await deployExchange(deployer, network);

  await deployer.deploy([
    [MockToken, "", "MOT", 18, mockTokenSupply],
    Marketplace,
    AsyncWithdraw,
    MarketplaceProvider,
    ComponentList
  ]);
}

async function deployOlympusIndex(deployer, network) {
  const args = Args.parseArgs();

  await deployer.deploy([
    AsyncWithdraw,
    Locker,
    RiskControl,
    MarketplaceProvider,
    PercentageFee,
    Reimbursable,
    WhitelistProvider,
    ComponentList,
    Steps
  ]);
  await deployExchange(deployer, network);
  await deployer.deploy(RebalanceProvider, ExchangeProvider.address);
}

// Running all the suits
function deployOnDev(deployer, num) {
  return deployer
    .then(() =>
      deployer.deploy([
        MarketplaceProvider,
        AsyncWithdraw,
        RiskControl,
        SimpleWithdraw,
        PercentageFee,
        Reimbursable,
        WhitelistProvider,
        ComponentList,
        StepProvider,
        Locker,
        [MockToken, "", "MOT", 18, mockTokenSupply]
      ])
    )
    .then(() => deployExchange(deployer, "development"))
    .then(() => deployer.deploy(RebalanceProvider, ExchangeProvider.address));
}

function deployOnKovan(deployer, num) {
  return deployer
    .then(() => deployer.deploy([[MockToken, "", "MOT", 18, mockTokenSupply]]))
    .then(() => deployer.deploy(MarketplaceProvider))
    .then(() => deployer.deploy(AsyncWithdraw))
    .then(() => deployer.deploy(Locker))
    .then(() => deployer.deploy(RiskControl))
    .then(() => deployer.deploy(SimpleWithdraw))
    .then(() => deployer.deploy(PercentageFee))
    .then(() => deployer.deploy(Reimbursable))
    .then(() => deployer.deploy(WhitelistProvider))
    .then(() => deployer.deploy(ComponentList))
    .then(() => deployExchange(deployer, "kovan"))
    .then(() => deployer.deploy(RebalanceProvider, ExchangeProvider.address));
}

function deployOnMainnet(deployer) {
  let deploy = deployer.then(() => {
    return deployer.deploy(MarketplaceProvider);
  });
  return deploy;
}

module.exports = function(deployer, network) {
  let flags = Args.parseArgs();

  if (flags.suite && typeof eval(`deploy${flags.suite}`) === "function") {
    return eval(`deploy${flags.suite}(deployer,network)`);
  }

  if (network == "mainnet" && flags.contract == "exchange") {
    return deployOnMainnet(deployer, network);
  } else if (network == "kovan") {
    return deployOnKovan(deployer, network);
  }

  return deployOnDev(deployer, network);
};
