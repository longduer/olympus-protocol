const log = require('../utils/log');
const Fund = artifacts.require("OlympusFund");
const AsyncWithdraw = artifacts.require("../../contracts/components/widrwaw/AsyncWithdraw.sol");
const RiskControl = artifacts.require("../../contracts/components/RiskControl.sol");
const MarketPlace = artifacts.require("../../contracts/MarketPlace.sol");


const TOKEN1 = 0x0041dee9f481a1d2aa74a3f1d0958c1db6107c686a;
const TOKEN2 = 0x3fb1c5555a04fc478784846296a35d1d2bf7e57c;

const fundData = {
  name: 'OlympusFund',
  symbol: 'MOF',
  description: 'Sample of real fund',
  decimals: 18,
}

const toToken = (amount) => {
  return amount * 10 ** fundData.decimals;
}

contract('Fund', (accounts) => {
  let fund;
  let market;
  const investorA = accounts[1];
  const investorB = accounts[2];

  it('Create a fund', async () => {
    market = await MarketPlace.deployed();

    fund = await Fund.new(fundData.name,
      fundData.symbol,
      fundData.description,
      fundData.decimals
    );

    assert.equal(await fund.status(), 0); // new
    console.log(AsyncWithdraw.address, 'Async address');
    await fund.initialize(
      MarketPlace.address,
      0x01, // Exchange, TODO add
      AsyncWithdraw.address,
      RiskControl.address,
      0x01, // Whitelist, to do
    );
    const myProducts = await market.getOwnProducts();

    assert.equal(myProducts.length, 1);
    assert.equal(myProducts[0], fund.address);
    assert.equal(await fund.status(), 1); // Active


  });

  it("Fund shall be able deploy", async () => log.catch(async () => {
    assert.equal((await fund.name()), fundData.name);
    assert.equal((await fund.description()), fundData.description);
    assert.equal((await fund.symbol()), fundData.symbol);
    assert.equal((await fund.version()), "1.0");

  }));

  it.skip("Missng exchanges", async () => log.catch(async () => {
    // TODO, when all providers are done, set WhiteList and ExchangeProvider into the fund confi
  }))

  it("Fund shall allow investment", async () => log.catch(async () => {

    // With 0 supply price is 1 eth
    assert.equal((await fund.totalSupply()).toNumber(), 0);
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, 'ether'));

    await fund.invest({ value: web3.toWei(1, 'ether'), from: investorA });
    await fund.invest({ value: web3.toWei(1, 'ether'), from: investorB });

    assert.equal((await fund.totalSupply()).toNumber(), web3.toWei(2, 'ether'));
    // Price is the same, as no Token value has changed
    assert.equal((await fund.getPrice()).toNumber(), web3.toWei(1, 'ether'));

    assert.equal((await fund.balanceOf(investorA)).toNumber(), toToken(1));
    assert.equal((await fund.balanceOf(investorB)).toNumber(), toToken(1));

  }));

  it.skip("Shall be able to buy and shell tokens", async () => log.catch(async () => {

  }));

  it("Shall be able to request and withdraw", async () => log.catch(async () => {

    await fund.setMaxTransfers(1); // For testing


    assert.equal(await fund.balanceOf(investorA), toToken(1), 'A has invested');
    assert.equal(await fund.balanceOf(investorB), toToken(1), 'B has invested');

    // Request
    await fund.requestWithdraw(toToken(1), { from: investorA });
    await fund.requestWithdraw(toToken(1), { from: investorB });

    // Withdraw max transfers is set to 1
    await fund.withdraw();
    assert.equal(await fund.withdrawInProgress(), true, ' Withdraw has not finished');
    assert.equal((await fund.balanceOf(investorA)).toNumber(), 0, ' A has withdraw');
    assert.equal((await fund.balanceOf(investorB)).toNumber(), toToken(1), ' B has no withdraw');

    // Second withdraw succeeds
    await fund.withdraw();
    assert.equal(await fund.withdrawInProgress(), false, ' Withdraw has finished');
    assert.equal((await fund.balanceOf(investorB)).toNumber(), 0, 'B has withdraw');

    await fund.setMaxTransfers(10); // Restore

  }))

  it.skip("Shall be able to dispatch a broken token", async () => log.catch(async () => {

  }));

  it.skip("Shall be able to close a fund", async () => log.catch(async () => {

  }));
});
