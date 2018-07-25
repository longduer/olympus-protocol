const log = require("../utils/log");
const calc = require("../utils/calc");
const { DerivativeProviders, ethToken, DerivativeStatus, DerivativeType } = require("../utils/constants");
const Fund = artifacts.require("OlympusBasicFund");
const AsyncWithdraw = artifacts.require("components/widrwaw/AsyncWithdraw");
const Marketplace = artifacts.require("Marketplace");
const MockToken = artifacts.require("MockToken");
const ComponentList = artifacts.require("ComponentList");

// Buy and sell tokens
const ExchangeProvider = artifacts.require("../contracts/components/exchange/ExchangeProvider");
const MockKyberNetwork = artifacts.require("../contracts/components/exchange/exchanges/MockKyberNetwork");
const ERC20 = artifacts.require("../contracts/libs/ERC20Extended");

const fundData = {
  name: "OlympusBasicFund",
  symbol: "MBF",
  category: "Tests",
  description: "Sample of base fund",
  decimals: 18,
  ethDeposit: 0.5, // ETH
  maxTransfers: 10
};

const toTokenWei = amount => {
  return amount * 10 ** fundData.decimals;
};

contract("BasicFund", accounts => {
  let fund;
  let market;
  let mockKyber;
  let tokens;
  let mockMOT;
  let exchange;
  let asyncWithdraw;
  let componentList;

  const investorA = accounts[1];
  const investorB = accounts[2];
  const investorC = accounts[3];
  before("Set Component list", async () => {
    mockMOT = await MockToken.deployed();
    market = await Marketplace.deployed();
    mockKyber = await MockKyberNetwork.deployed();
    tokens = await mockKyber.supportedTokens();
    exchange = await ExchangeProvider.deployed();
    asyncWithdraw = await AsyncWithdraw.deployed();
    componentList = await ComponentList.deployed();

    await exchange.setMotAddress(mockMOT.address);
    await asyncWithdraw.setMotAddress(mockMOT.address);

    componentList.setComponent(DerivativeProviders.MARKET, market.address);
    componentList.setComponent(DerivativeProviders.EXCHANGE, exchange.address);
    componentList.setComponent(DerivativeProviders.WITHDRAW, asyncWithdraw.address);
  });

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

    await calc.assertReverts(async () => await fund.changeStatus(DerivativeStatus.Active), "Must be still new");

    await fund.initializeFund(componentList.address, {
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

  it("Cant call initialize twice ", async () => {
    await calc.assertReverts(async () => {
      await fund.initializeFund(componentList.address, {
        value: web3.toWei(fundData.ethDeposit, "ether")
      });
    }, "Shall revert");
  });

  it("Update component shall approve MOT ", async () => {
    // Set new market place
    const newWithdraw = await AsyncWithdraw.new();
    await newWithdraw.setMotAddress(mockMOT.address);

    await componentList.setComponent(await fund.RISK(), newWithdraw.address);
    await fund.updateComponent(await fund.RISK());
    assert.equal(await fund.getComponentByName(await fund.RISK()), newWithdraw.address);

    // Check we allowance
    const allowance = await mockMOT.allowance(fund.address, newWithdraw.address);
    assert.isAbove(allowance, 10 ** 32, 0, "MOT is approved for new component");
  });

  it("Fund shall be able to deploy", async () => {
    assert.equal(await fund.name(), fundData.name);
    assert.equal(await fund.description(), fundData.description);
    assert.equal(await fund.symbol(), fundData.symbol);
    assert.equal(await fund.category(), fundData.category);
    assert.equal(await fund.version(), "1.0");
    assert.equal((await fund.fundType()).toNumber(), DerivativeType.Fund);
  });

  it("Fund shall allow investment", async () => {
    let tx;
    // With 0 supply price is 1 eth
    assert.equal((await fund.totalSupply()).toNumber(), 0, "Starting supply is 0");
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, "ether"));

    tx = await fund.invest({ value: web3.toWei(1, "ether"), from: investorA });
    tx = await fund.invest({ value: web3.toWei(1, "ether"), from: investorB });

    assert.equal((await fund.totalSupply()).toNumber(), web3.toWei(2, "ether"), "Supply is updated");
    // Price is the same, as no Token value has changed
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, "ether"));

    assert.equal((await fund.balanceOf(investorA)).toNumber(), toTokenWei(1));
    assert.equal((await fund.balanceOf(investorB)).toNumber(), toTokenWei(1));
  });

  it("Shall be able to request and withdraw", async () => {
    let tx;
    let val = toTokenWei(1);

    assert.equal((await fund.balanceOf(investorA)).toNumber(), val, "A has invested");
    assert.equal((await fund.balanceOf(investorB)).toNumber(), val, "B has invested");

    // Request
    tx = await fund.withdraw({ from: investorA });
    assert.equal((await fund.balanceOf(investorA)).toNumber(), 0, " A has withdrawn");

    tx = await fund.withdraw({ from: investorB });
    assert.equal((await fund.balanceOf(investorB)).toNumber(), 0, "B has withdrawn");
  });

  it("Shall be able to invest", async () => {
    let tx;

    // invest allowed
    await fund.invest({ value: web3.toWei(1, "ether"), from: investorA });
    await fund.invest({ value: web3.toWei(1, "ether"), from: investorB });

    // Request always allowed
    await fund.withdraw({ from: investorA });
    assert.equal((await fund.balanceOf(investorA)).toNumber(), 0, " A has withdrawn");

    await fund.withdraw({ from: investorB });
    assert.equal((await fund.balanceOf(investorB)).toNumber(), 0, " B has withdrawn");
  });

  it("Buy tokens fails if ether required is not enough", async () => {
    // invest allowed
    await fund.invest({ value: web3.toWei(1.8, "ether"), from: investorA });

    const balance = (await fund.getETHBalance()).toNumber();

    assert.equal(balance, web3.toWei(1.8, "ether"), "This test must start with 1.8 eth");
    const amounts = [web3.toWei(1, "ether"), web3.toWei(1, "ether")];

    const rates = await Promise.all(
      tokens.map(async token => await mockKyber.getExpectedRate(ethToken, token, web3.toWei(0.5, "ether")))
    );

    await calc.assertReverts(
      async () => await fund.buyTokens(0x0, tokens, amounts, rates.map(rate => rate[0])),
      "reverte if fund balance is not enough"
    );
  });

  it("Shall be able to buy tokens", async () => {
    // From the preivus test we got 1.8 ETH
    const initialBalance = (await fund.getETHBalance()).toNumber();
    assert.equal(initialBalance, web3.toWei(1.8, "ether"), "This test must start with 1.8 eth");

    const rates = await Promise.all(
      tokens.map(async token => await mockKyber.getExpectedRate(ethToken, token, web3.toWei(0.5, "ether")))
    );
    const amounts = [web3.toWei(0.5, "ether"), web3.toWei(0.5, "ether")];

    let tx;
    tx = await fund.buyTokens("", tokens, amounts, rates.map(rate => rate[0]));

    const fundTokensAndBalance = await fund.getTokens();
    for (let i = 0; i < tokens.length; i++) {
      let erc20 = await ERC20.at(tokens[i]);
      let balance = await erc20.balanceOf(fund.address);
      assert.equal(balance, 0.5 * rates[i][0], " Fund get ERC20 correct balance");
      // Check the fund data is updated correctly
      assert.equal(fundTokensAndBalance[0][i], tokens[i], "Token exist in fund");
      assert.equal(fundTokensAndBalance[1][i].toNumber(), 0.5 * rates[i][0], "Balance is correct in th fund");
    }

    // Price is constant
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, "ether"), "Price keeps constant after buy tokens");
    // ETH balance is reduced
    assert.equal((await fund.getETHBalance()).toNumber(), web3.toWei(0.8, "ether"), "ETH balance reduced");
  });

  it("Shall be able to sell tokens", async () => {
    let tx;
    // From the preivus test we got 1.8 ETH
    const initialBalance = (await fund.getETHBalance()).toNumber();

    assert.equal(initialBalance, web3.toWei(0.8, "ether"), "This test must start with 1.8 eth");
    let fundTokensAndBalance = await fund.getTokens();
    const balances = fundTokensAndBalance.map(tokenBalance => tokenBalance[1]);
    const sellRates = await Promise.all(
      tokens.map(async (token, index) => await mockKyber.getExpectedRate(token, ethToken, balances[index]))
    );
    // We sell all
    tx = await fund.sellTokens("", fundTokensAndBalance[0], fundTokensAndBalance[1], sellRates.map(rate => rate[0]));

    fundTokensAndBalance = await fund.getTokens();

    for (let i = 0; i < tokens.length; i++) {
      let erc20 = await ERC20.at(tokens[i]);
      let balance = await erc20.balanceOf(fund.address);
      assert.equal(balance.toNumber(), 0, "Fund get ERC20 correct balance");
      // Check the fund data is updated correctly
      assert.equal(fundTokensAndBalance[0][i], tokens[i], "Token exist in fund");
      assert.equal(fundTokensAndBalance[1][i].toNumber(), 0, "Balance is correct in the fund");
    }

    // Price is constant
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, "ether"), "Price keeps constant after buy tokens");
    // ETH balance is reduced
    assert.equal((await fund.getETHBalance()).toNumber(), web3.toWei(1.8, "ether"), "ETH balance reduced");
  });

  it("Shall be able to sell tokens to get enough eth for withdraw", async () => {
    // From the preivus test we got 1.8 ETH, and investor got 1.8 Token
    const initialBalance = (await fund.getETHBalance()).toNumber();
    assert.equal(initialBalance, web3.toWei(1.8, "ether"), "This test must start with 1.8 eth");
    assert.equal((await fund.balanceOf(investorA)).toNumber(), toTokenWei(1.8), "A has invested with fee");
    const investorABefore = await calc.ethBalance(investorA);

    const rates = await Promise.all(
      tokens.map(async token => await mockKyber.getExpectedRate(ethToken, token, web3.toWei(0.5, "ether")))
    );
    const amounts = [web3.toWei(0.9, "ether"), web3.toWei(0.9, "ether")];
    await fund.buyTokens("", tokens, amounts, rates.map(rate => rate[0]));

    for (let i = 0; i < tokens.length; i++) {
      let erc20 = await ERC20.at(tokens[i]);
      let balance = await erc20.balanceOf(fund.address);
      assert.equal(balance.toNumber(), 0.9 * rates[i][0], " Fund get ERC20 correct balance");
    }

    assert.equal((await fund.getETHBalance()).toNumber(), web3.toWei(0, "ether"), "We sold all underlying tokens");
    // Request withdraw, it should sell all tokens.
    await fund.withdraw({ from: investorA });

    // Investor has recover all his eth  tokens
    const investorAAfter = await calc.ethBalance(investorA);
    assert.equal((await fund.balanceOf(investorA)).toNumber(), toTokenWei(0), "Investor redeemed all the funds");
    assert.equal(calc.roundTo(investorABefore + 1.8, 2), calc.roundTo(investorAAfter, 2), "Investor A received ether");

    // Price is constant
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, "ether"), "Price keeps constant after buy tokens");
  });

  it("Shall be able to change the status", async () => {
    assert.equal((await fund.status()).toNumber(), DerivativeStatus.Active, "Status Is active");
    await fund.changeStatus(DerivativeStatus.Paused);
    assert.equal((await fund.status()).toNumber(), DerivativeStatus.Paused, " Status is paused");
    await fund.changeStatus(DerivativeStatus.Active);
    assert.equal((await fund.status()).toNumber(), DerivativeStatus.Active, "Status Is active");

    await calc.assertReverts(
      async () => await fund.changeStatus(DerivativeStatus.New),
      "Shall not be able to change to New"
    );
    assert.equal((await fund.status()).toNumber(), DerivativeStatus.Active, " Cant change to new");

    await calc.assertReverts(
      async () => await fund.changeStatus(DerivativeStatus.Closed),
      "Shall not  change to Close"
    );
    assert.equal((await fund.status()).toNumber(), DerivativeStatus.Active, " Cant change to close");
  });

  it("Shall be able to close a fund", async () => {
    await fund.invest({ value: web3.toWei(2, "ether"), from: investorC });
    const initialBalance = (await fund.getETHBalance()).toNumber();
    assert.equal((await fund.balanceOf(investorC)).toNumber(), toTokenWei(2), "C has invested");

    const rates = await Promise.all(
      tokens.map(async token => await mockKyber.getExpectedRate(ethToken, token, web3.toWei(0.5, "ether")))
    );
    const amounts = [web3.toWei(1, "ether"), web3.toWei(1, "ether")];
    await fund.buyTokens("", tokens, amounts, rates.map(rate => rate[0]));

    // ETH balance is reduced
    assert.equal((await fund.getETHBalance()).toNumber(), web3.toWei(0, "ether"), "ETH balance reduced");

    await fund.close();
    assert.equal((await fund.status()).toNumber(), DerivativeStatus.Closed, " Status is closed");

    let fundTokensAndBalance = await fund.getTokens();
    assert.equal(fundTokensAndBalance[1][0].toNumber(), 0, "token amount == 0");
    assert.equal(fundTokensAndBalance[1][1].toNumber(), 0, "token amount == 0");

    assert.equal((await fund.getETHBalance()).toNumber(), web3.toWei(2, "ether"), "ETH balance returned");
    await calc.assertReverts(async () => await fund.changeStatus(DerivativeStatus.Active), "Shall not be  close");
    assert.equal((await fund.status()).toNumber(), DerivativeStatus.Closed, " Cant change to active ");
  });

  it("Investor cant invest but can withdraw after close", async () => {
    assert.equal((await fund.balanceOf(investorC)).toNumber(), toTokenWei(2), "C starting balance");

    // Investor cant invest can withdraw
    await calc.assertReverts(
      async () => await fund.invest({ value: web3.toWei(1, "ether"), from: investorA }),
      "Cant invest after close"
    );
    // Request
    await fund.withdraw({ from: investorC });
    assert.equal((await fund.balanceOf(investorC)).toNumber(), 0, " A has withdrawn");
  });
});
