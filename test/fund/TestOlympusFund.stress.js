const log = require("../utils/log");
const calc = require("../utils/calc");
const {
  DerivativeProviders,
  ethToken,
  DerivativeStatus,
  WhitelistType,
  DerivativeType
} = require("../utils/constants");
const Fund = artifacts.require("OlympusFund");
const AsyncWithdraw = artifacts.require("components/widrwaw/AsyncWithdraw");
const RiskControl = artifacts.require("components/RiskControl");
const Marketplace = artifacts.require("Marketplace");
const PercentageFee = artifacts.require("PercentageFee");
const Reimbursable = artifacts.require("Reimbursable");
const MockToken = artifacts.require("MockToken");
const Whitelist = artifacts.require("WhitelistProvider");
const ComponentList = artifacts.require("ComponentList");
const LockerProvider = artifacts.require("Locker");
const StepProvider = artifacts.require("StepProvider");
const TokenBroken = artifacts.require("TokenBroken");

// Buy and sell tokens
const ExchangeProvider = artifacts.require("../contracts/components/exchange/ExchangeProvider");
const MockKyberNetwork = artifacts.require("../contracts/components/exchange/exchanges/MockKyberNetwork");
const ERC20 = artifacts.require("../contracts/libs/ERC20Extended");

const fundData = {
  name: "OlympusFund",
  symbol: "MOF",
  category: "Tests",
  description: "Sample of real fund",
  decimals: 18,
  managmentFee: 0.1,
  initialManagementFee: 0,
  withdrawInterval: 0,
  wrongEthDeposit: 0.05,
  ethDeposit: 0.5, // ETH
  maxTransfers: 10
};

const toTokenWei = amount => {
  return amount * 10 ** fundData.decimals;
};

contract("Fund", accounts => {
  let fund;
  let market;
  let mockKyber;
  let tokens;
  let mockMOT;
  let exchange;
  let asyncWithdraw;
  let riskControl;
  let percentageFee;
  let whitelist;
  let reimbursable;
  let componentList;
  let locker;
  let stepProvider;
  let tokenBroken;
  let token0_erc20;
  let token1_erc20;

  const investorA = accounts[1];
  const investorB = accounts[2];
  const investorC = accounts[3];
  const investorD = accounts[4];
  const investorE = accounts[5];
  const investorF = accounts[6];
  const investorG = accounts[7];
  const investorH = accounts[8];
  const investorI = accounts[9];
  const investorJ = accounts[0];

  before("Set Component list", async () => {
    mockMOT = await MockToken.deployed();
    market = await Marketplace.deployed();
    mockKyber = await MockKyberNetwork.deployed();
    tokens = await mockKyber.supportedTokens();
    exchange = await ExchangeProvider.deployed();
    asyncWithdraw = await AsyncWithdraw.deployed();
    riskControl = await RiskControl.deployed();
    percentageFee = await PercentageFee.deployed();
    whitelist = await Whitelist.deployed();
    reimbursable = await Reimbursable.deployed();
    componentList = await ComponentList.deployed();
    locker = await LockerProvider.deployed();
    stepProvider = await StepProvider.deployed();
    tokenBroken = await TokenBroken.deployed();

    await exchange.setMotAddress(mockMOT.address);
    await asyncWithdraw.setMotAddress(mockMOT.address);
    await riskControl.setMotAddress(mockMOT.address);
    await percentageFee.setMotAddress(mockMOT.address);
    await whitelist.setMotAddress(mockMOT.address);
    await reimbursable.setMotAddress(mockMOT.address);

    componentList.setComponent(DerivativeProviders.MARKET, market.address);
    componentList.setComponent(DerivativeProviders.EXCHANGE, exchange.address);
    componentList.setComponent(DerivativeProviders.WITHDRAW, asyncWithdraw.address);
    componentList.setComponent(DerivativeProviders.RISK, riskControl.address);
    componentList.setComponent(DerivativeProviders.FEE, percentageFee.address);
    componentList.setComponent(DerivativeProviders.WHITELIST, whitelist.address);
    componentList.setComponent(DerivativeProviders.REIMBURSABLE, reimbursable.address);
    componentList.setComponent(DerivativeProviders.STEP, stepProvider.address);
    componentList.setComponent(DerivativeProviders.LOCKER, locker.address);
    componentList.setComponent(DerivativeProviders.TOKENBROKEN, tokenBroken.address);
    token0_erc20 = await ERC20.at(await tokens[0]);
    token1_erc20 = await ERC20.at(await tokens[1]);
  });
  // ----------------------------- REQUIRED FOR CREATION ----------------------
  it("Create a fund", async () => {
    fund = await Fund.new(
      fundData.name,
      fundData.symbol,
      fundData.description,
      fundData.category,
      fundData.decimals,
      { gas: 8e6 } // At the moment require 5.7M
    );
    assert.equal((await fund.status()).toNumber(), 0); // new

    await calc.assertReverts(async () => {
      await fund.initialize(componentList.address, fundData.initialManagementFee, fundData.withdrawInterval, {
        value: web3.toWei(fundData.wrongEthDeposit, "ether")
      });
    }, "initial ETH should be equal or more than 0.1 ETH");

    await fund.initialize(componentList.address, fundData.initialManagementFee, fundData.withdrawInterval, {
      value: web3.toWei(fundData.ethDeposit, "ether")
    });
    const myProducts = await market.getOwnProducts();

    assert.equal(myProducts.length, 1);
    assert.equal(myProducts[0], fund.address);
    assert.equal((await fund.status()).toNumber(), 1); // Active
    // The fee send is not taked in account in the price but as a fee
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, "ether"));
    assert.equal((await fund.accumulatedFee()).toNumber(), web3.toWei(0.5, "ether"));
  });
  
  it("Invest 10 times and buy tokens", async () => {
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorA
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorB
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorC
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorD
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorE
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorF
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorG
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorH
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorI
    });
    await fund.invest({
      value: web3.toWei(0.01, "ether"),
      from: investorJ
    });


    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, "ether"));
    const rates_KNC = await mockKyber.getExpectedRate(ethToken, tokens[0], web3.toWei(0.05, "ether"));
    const rates_EOS = await mockKyber.getExpectedRate(ethToken, tokens[0], web3.toWei(0.05, "ether"));
    console.log(rates_KNC,rates_EOS);
    const amounts = [web3.toWei(0.05, "ether"), web3.toWei(0.05, "ether")];
    console.log(amounts);
    let tx;
    tx = await fund.buyTokens("", [tokens[0],tokens[1]], amounts, [rates_KNC,rates_EOS]);

  });

  it("Create a fund", async () => {
    
  });


  })
