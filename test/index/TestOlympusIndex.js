const log = require("../utils/log");
const calc = require("../utils/calc");

const OlympusIndex = artifacts.require("OlympusIndex");
const Rebalance = artifacts.require("RebalanceProvider");
const RiskControl = artifacts.require("RiskControl");
const Marketplace = artifacts.require("Marketplace");
const Whitelist = artifacts.require("WhitelistProvider");
const Withdraw = artifacts.require("AsyncWithdraw");
const MockToken = artifacts.require("MockToken");

const PercentageFee = artifacts.require("PercentageFee");
const Reimbursable = artifacts.require("Reimbursable");

// Buy and sell tokens
const ExchangeProvider = artifacts.require("../contracts/components/exchange/ExchangeProvider");
const MockKyberNetwork = artifacts.require(
  "../contracts/components/exchange/exchanges/MockKyberNetwork"
);
const ERC20 = artifacts.require("../contracts/libs/ERC20Extended");

const ethToken = "0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

let DerivativeStatus = { New: 0, Active: 1, Paused: 2, Closed: 3 };
let DerivativeType = { Index: 0, index: 1 };

const indexData = {
  name: "OlympusIndex",
  symbol: "OlympusIndex",
  description: "Sample of real index",
  category: "Index",
  decimals: 18,
  managmentFee: 0.1,
  ethDeposit: 0.5, // ETH
  weights: [50, 50],
  tokensLenght: 2
};
const toToken = amount => {
  return amount * 10 ** indexData.decimals;
};

contract("Olympus Index", accounts => {
  let index;
  let market;
  let mockKyber;
  let mockMOT;
  let exchange;
  let asyncWithdraw;
  let riskControl;
  let percentageFee;
  let rebalance;

  let tokens;
  const investorA = accounts[1];
  const investorB = accounts[2];
  const investorC = accounts[3];

  it("Required same tokens than weights on create", async () => {
    try {
      await OlympusIndex.new(
        indexData.name,
        indexData.decimals,
        indexData.symbol,
        indexData.description,
        indexData.category,
        tokens.slice(0, indexData.tokensLenght),
        []
      );
      assert(false, "Shall revert");
    } catch (e) {
      assert(true, "Shall revert");
    }
  });

  it("Create a index", async () => {
    market = await Marketplace.deployed();
    mockKyber = await MockKyberNetwork.deployed();
    tokens = await mockKyber.supportedTokens();
    mockMOT = await MockToken.deployed();
    exchange = await ExchangeProvider.deployed();
    asyncWithdraw = await Withdraw.deployed();
    riskControl = await RiskControl.deployed();
    percentageFee = await PercentageFee.deployed();
    rebalance = await Rebalance.deployed();

    index = await OlympusIndex.new(
      indexData.name,
      indexData.decimals,
      indexData.symbol,
      indexData.description,
      indexData.category,
      tokens.slice(0, indexData.tokensLenght),
      indexData.weights
    );

    assert.equal((await index.status()).toNumber(), 0); // new

    try {
      await index.changeStatus(DerivativeStatus.Active);
      assert(false, "Shall not be able to from New to other status");
    } catch (e) {
      assert.equal((await index.status()).toNumber(), DerivativeStatus.New, "Must be still new");
    }

    await exchange.setMotAddress(mockMOT.address);
    await asyncWithdraw.setMotAddress(mockMOT.address);
    await riskControl.setMotAddress(mockMOT.address);
    await percentageFee.setMotAddress(mockMOT.address);
    await rebalance.setMotAddress(mockMOT.address);

    await index.initialize(
      Marketplace.address,
      ExchangeProvider.address,
      Rebalance.address,
      Withdraw.address,
      RiskControl.address,
      Whitelist.address,
      Reimbursable.address,
      PercentageFee.address,
      0,
      { value: web3.toWei(indexData.ethDeposit, "ether") }
    );
    const myProducts = await market.getOwnProducts();

    assert.equal(myProducts.length, 1);
    assert.equal(myProducts[0], index.address);
    assert.equal((await index.status()).toNumber(), 1); // Active
    // The fee send is not taked in account in the price but as a fee
    assert.equal((await index.getPrice()).toNumber(), web3.toWei(1, "ether"));
    assert.equal((await index.accumulatedFee()).toNumber(), web3.toWei(0.5, "ether"));
  });

  it("Cant call initialize twice ", async () => {
    try {
      await index.initialize(
        Marketplace.address,
        ExchangeProvider.address,
        Rebalance.address,
        Withdraw.address,
        RiskControl.address,
        Whitelist.address,
        Reimbursable.address,
        PercentageFee.address,
        0,
        { value: web3.toWei(indexData.ethDeposit, "ether") }
      );
      assert(false, "Shall revert");
    } catch (e) {
      assert(true, "Shall revert");
    }
  });

  it("Can change market provider and register in the new marketplace ", async () => {
    // Cant register without changing of market provider
    try {
      await index.registerInNewMarketplace();
      assert(false, "Shall not register");
    } catch (e) {
      assert(true, "Shall not register");
    }
    // Set new market place
    const newMarket = await Marketplace.new();
    await index.setComponentExternal(await index.MARKET(), newMarket.address);
    assert.equal(await index.getComponentByName(await index.MARKET()), newMarket.address);

    // Check we have register
    await index.registerInNewMarketplace();
    const myProducts = await newMarket.getOwnProducts();
    assert.equal(myProducts.length, 1);
    assert.equal(myProducts[0], index.address);
  });

  it("Index shall be able deploy", async () => {
    assert.equal(await index.name(), indexData.name);
    assert.equal(await index.description(), indexData.description);
    assert.equal(await index.category(), indexData.category);
    assert.equal(await index.symbol(), indexData.symbol);
    assert.equal(await index.version(), "1.0");
    assert.equal((await index.fundType()).toNumber(), DerivativeType.Index);
    assert.equal((await index.totalSupply()).toNumber(), 0);
    const [indexTokens, weights] = await index.getTokens();

    for (let i = 0; i < indexData.tokensLenght; i++) {
      assert.equal(tokens[i], indexTokens[i], "Token is set correctly");
      assert.equal(indexData.weights[i], weights[i].toNumber(), "Weight is set correctly");
    }
  });

  it("Index shall allow investment", async () => {
    // With 0 supply price is 1 eth
    assert.equal((await index.totalSupply()).toNumber(), 0, "Starting supply is 0");
    assert.equal((await index.getPrice()).toNumber(), web3.toWei(1, "ether"));

    await index.invest({ value: web3.toWei(1, "ether"), from: investorA });
    await index.invest({ value: web3.toWei(1, "ether"), from: investorB });

    assert.equal(
      (await index.totalSupply()).toNumber(),
      web3.toWei(2, "ether"),
      "Supply is updated"
    );
    // Price is the same, as no Token value has changed
    assert.equal((await index.getPrice()).toNumber(), web3.toWei(1, "ether"));

    assert.equal((await index.balanceOf(investorA)).toNumber(), toToken(1));
    assert.equal((await index.balanceOf(investorB)).toNumber(), toToken(1));
  });

  it("Shall be able to request and withdraw", async () => {
    let tx;
    await index.setMaxTransfers(1); // For testing

    assert.equal((await index.balanceOf(investorA)).toNumber(), toToken(1), "A has invested");
    assert.equal((await index.balanceOf(investorB)).toNumber(), toToken(1), "B has invested");

    // Request
    await index.requestWithdraw(toToken(1), { from: investorA });
    await index.requestWithdraw(toToken(1), { from: investorB });

    // Withdraw max transfers is set to 1
    tx = await index.withdraw();
    assert(calc.getEvent(tx, "Reimbursed").args.amount.toNumber() > 0, " Owner got Reimbursed");

    assert.equal(await index.withdrawInProgress(), true, " Withdraw has not finished");
    assert.equal((await index.balanceOf(investorA)).toNumber(), 0, " A has withdraw");
    assert.equal((await index.balanceOf(investorB)).toNumber(), toToken(1), " B has no withdraw");

    // Second withdraw succeeds
    tx = await index.withdraw();
    assert(calc.getEvent(tx, "Reimbursed").args.amount.toNumber() > 0, " Owner got Reimbursed 2");

    assert.equal(await index.withdrawInProgress(), false, " Withdraw has finished");
    assert.equal((await index.balanceOf(investorB)).toNumber(), 0, "B has withdraw");

    await index.setMaxTransfers(10); // Restore
  });

  it("Manager shall be able to collect a from investment and withdraw it", async () => {
    // Set fee
    const denominator = (await (await PercentageFee.deployed()).DENOMINATOR()).toNumber();
    await index.setManagementFee(indexData.managmentFee * denominator);
    assert.equal(
      (await index.getManagementFee()).toNumber(),
      indexData.managmentFee * denominator,
      "Fee is set correctly"
    );
    // Invest two times (two different logics for first time and others)
    await index.invest({ value: web3.toWei(1, "ether"), from: investorA });

    await index.invest({ value: web3.toWei(1, "ether"), from: investorA });

    const expectedFee = 0.5 + 0.2 - 0.01; // Base Fee + Fee from investments - commision of withdraw
    assert(
      calc.inRange(
        (await index.accumulatedFee()).toNumber(),
        web3.toWei(expectedFee, "ether"),
        web3.toWei(0.1, "ether")
      ),
      "Owner got fee"
    );

    assert.equal(
      (await index.balanceOf(investorA)).toNumber(),
      toToken(1.8),
      "A has invested with fee"
    );

    // Withdraw
    const ownerBalanceInital = await calc.ethBalance(accounts[0]);
    await index.withdrawFee(web3.toWei(0.2, "ether"));

    assert(
      calc.inRange(
        (await index.accumulatedFee()).toNumber(),
        web3.toWei(expectedFee - 0.2, "ether"),
        web3.toWei(0.1, "ether")
      ),
      "Owner pending fee"
    );

    const ownerBalanceAfter = await calc.ethBalance(accounts[0]);

    assert.equal(
      calc.roundTo(ownerBalanceInital + 2 * indexData.managmentFee, 2),
      calc.roundTo(ownerBalanceAfter, 2),
      "Owner received ether"
    );
  });

  it.skip("Shall be able to rebalance", async () => {
    // From the preivus test we got 1.8 ETH
    assert.equal(
      (await index.getETHBalance()).toNumber(),
      web3.toWei(1.8, "ether"),
      "This test must start with 1.8 eth"
    );
  });

  it("Shall be able to sell tokens to get enough eth for withdraw", async () => {
    // From the preivus test we got 1.8 ETH, and investor got 1.8 Token
    assert.equal(
      (await index.getETHBalance()).toNumber(),
      web3.toWei(1.8, "ether"),
      "This test must start with 1.8 eth"
    );
    assert.equal(
      (await index.balanceOf(investorA)).toNumber(),
      toToken(1.8),
      "A has invested with fee"
    );
    const investorABefore = await calc.ethBalance(investorA);

    // TODO REBALANCE

    // Request
    await index.requestWithdraw(toToken(1.8), { from: investorA });
    tx = await index.withdraw();

    // Investor has recover all his eth sepp9jgt tokens
    const investorAAfter = await calc.ethBalance(investorA);
    assert.equal(
      (await index.balanceOf(investorA)).toNumber(),
      toToken(0),
      "Investor redeemed all the founds"
    );
    assert.equal(
      calc.roundTo(investorABefore + 1.8, 2),
      calc.roundTo(investorAAfter, 2),
      "Investor A received ether"
    );

    // Price is constant
    assert.equal(
      (await index.getPrice()).toNumber(),
      web3.toWei(1, "ether"),
      "Price keeps constant after buy tokens"
    );
  });

  it("Shall be able to change the status", async () => {
    assert.equal((await index.status()).toNumber(), DerivativeStatus.Active, "Status Is active");
    await index.changeStatus(DerivativeStatus.Paused);
    assert.equal((await index.status()).toNumber(), DerivativeStatus.Paused, " Status is paused");
    await index.changeStatus(DerivativeStatus.Active);
    assert.equal((await index.status()).toNumber(), DerivativeStatus.Active, "Status Is active");
    try {
      await index.changeStatus(DerivativeStatus.New);
      assert(false, "Shall not be able to change to New");
    } catch (e) {
      assert.equal(
        (await index.status()).toNumber(),
        DerivativeStatus.Active,
        " Cant change to new, shall keep being previous"
      );
    }

    try {
      await index.changeStatus(DerivativeStatus.Closed);
      assert(false, "Shall not be able to change to Close");
    } catch (e) {
      assert.equal(
        (await index.status()).toNumber(),
        DerivativeStatus.Active,
        " Cant change to close, shall keep being previous"
      );
    }
  });

  it("Shall be able to close a index", async () => {
    await index.invest({ value: web3.toWei(2, "ether"), from: investorC });

    assert.equal(
      (await index.getETHBalance()).toNumber(),
      web3.toWei(1.8, "ether"),
      "This test must start with 1.8 eth"
    );
    assert.equal(
      (await index.balanceOf(investorC)).toNumber(),
      toToken(1.8),
      "C has invested with fee"
    );

    // TODO REBALANCE

    await index.close();
    assert.equal((await index.status()).toNumber(), DerivativeStatus.Closed, " Status is closed");
    // TODO VERIFY TOKENS ARE SOLD
    for (let i = 0; i < indexData.tokensLenght; i++) {
      let erc20 = await ERC20.at(tokens[i]);
      let balance = await erc20.balanceOf(index.address);
      assert.equal(balance.toNumber(), 0, "Tokens are sold");
    }

    assert.equal(
      (await index.getETHBalance()).toNumber(),
      web3.toWei(1.8, "ether"),
      "ETH balance returned"
    );

    try {
      await index.changeStatus(DerivativeStatus.Active);
      assert(false, "Shall not be able to change from close");
    } catch (e) {
      assert.equal(
        (await index.status()).toNumber(),
        DerivativeStatus.Closed,
        " Cant change to active, shall keep being closed"
      );
    }
  });
});
