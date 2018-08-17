# Fund

### Introduction

An investment fund is a supply of capital belonging to numerous investors used to collectively purchase securities while each investor retains ownership and control of their own shares. The document serves as a guideline to build applications and tools to serve a new rising group of cryptocurrency product creators and investment managers.

### Constructor

```javascript
constructor(
    string _name,
    string _symbol,
    string _description,
    string _category,
    uint _decimals
    ) public;
```

#### &emsp;Parameters
> \_name: Fund name</br> > \_symbol: Fund symbol (The derivative is ERC20 compatible, so it follows the rules of the ERC20 standard. For example: the symbol length can be any, but it's recommended to keep it between two to five characters for convenience when displaying)</br> > \_description: Fund description</br> > \_category: Fund category</br> > \_decimals: Fund decimals (normally it should be 18)</br>

#### &emsp;Example code
```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const name = "YH";
const symbol = "YH";
const description = "YH's Fund";
const category = "YH";
const decimals = 18;

// Get gas price
const gasPrice
web3.eth.getGasPrice((err, price)=>{
  if (err) {
    return console.error(err);
  }
  gasPrice = price;
})

// Get gas limit
const gasLimit;
const data = web3.eth.contract(abi).new.getData({
    name,
    symbol,
    description,
    category,
    decimals,
    {
      data: new Buffer(bytecode, 'utf8'),
    }
})
web3.eth.estimateGas(data,(err,gas)=>{
  if (err) {
   return console.error(err);
  }
  gasLimit = gas;
})

// Deploy and get fund address
web3.eth.contract(abi).new(
      name,
      symbol,
      description,
      category,
      decimals,
      {
        from: web3.eth.accounts[0],
        data: new Buffer(bytecode, 'utf8'),
        gas: gasLimit,
        gasPrice: gasPrice,
      },
      (err: Error, newFund: any) => {
        if (err) {
          return console.error(err);
        }
        if (newFund && newFund.address) {
          // Now the fund is deployed, you can get the fund contract address.
          console.log(newFund.address)
        }
      }));
```

### Basic info
> The code below shows how to get fund's basic information, including fund's name, symbol, description, category and decimals.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address); // address: deployed fund contract address
// Name
fundContract.name((err,name)=>{
  if (err) {
    return console.error(err);
  }
  console.log(name);
})
// Symbol
fundContract.symbol((err,symbol)=>{
  if (err) {
    return console.error(err);
  }
  console.log(symbol)
})
// Description
fundContract.description((err,description)=>{
  if (err) {
    return console.error(err);
  }
  console.log(description)
})
// Category
fundContract.category((err,category)=>{
  if (err) {
    return console.error(err);
  }
  console.log(category)
})
// Decimals
fundContract.decimals((err,decimals)=>{
  if (err) {
    return console.error(err);
  }
  console.log(decimals)
})
```

### Interface

#### 1. initialize

```javascript
function initialize(address _componentList, uint _initialFundFee) onlyOwner external payable;
```

#### &emsp;Description
> Initialize the fund contract that was created before, with the specified configurations. It will also be registered in the Olympus Product List and users can start investing into the fund after calling this function.

#### &emsp;Parameters
> \_componentList: Address of the Olympus component list (The deployed component list address can be retrieved by clicking on the link at the end of the doc)</br>
  \_initialFundFee: The fee that the owner will take from the investments. Must be based on DENOMINATOR, so 1% is 1000 </br>
> value: The initial balance of the fund

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const fundContract = web3.eth.contract(abi).at(address);
const _componentList = "0x...";
const _initialFundFee = "0x...";
const initialBalance = 1 ** 17
fundContract.initialize(_componentList, _initialFundFee, {from: web3.eth.accounts[0],value: initialBalance}, err => {
  if (err) {
    return console.error(err);
  }
});
```

#### 2. buyTokens

```javascript
function buyTokens(bytes32 _exchangeId, ERC20Extended[] _tokens, uint[] _amounts, uint[] _minimumRates) public onlyOwnerOrWhitelisted(WhitelistKeys.Admin) returns(bool);
```

#### &emsp;Description
> Call the function to buy any combination of tokens.

#### &emsp;Returns
> Whether the function executed successfully or not.

#### &emsp;Parameters
> _exchangeId: You can choose which exchange will be used to trade. If an empty string is passed, it will automatically choose the exchange with the best rates.</br>
  _tokens: ERC20 addresses of the tokens to buy.</br>
  _amounts: The corresponding amount of tokens to buy.</br>
  _minimumRates: The minimum amount of tokens per ETH in wei.</br>

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const _exchangeId = 0x0;
const _tokens = ["0x41dee9f481a1d2aa74a3f1d0958c1db6107c686a","0xd7cbe7bfc7d2de0b35b93712f113cae4deff426b"];
const _amounts = [10**17,10**17];
const _minimumRates = [0,0];

fundContract.buyTokens(_exchangeId, _tokens, _amounts, _minimumRates, (err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 3. sellTokens

```javascript
function sellTokens(bytes32 _exchangeId, ERC20Extended[] _tokens, uint[] _amounts, uint[]  _rates)
      public onlyOwnerOrWhitelisted(WhitelistKeys.Admin) returns (bool);
```

#### &emsp;Description
> Call the function for fund manager or whitelisted fund administrator to sell any combination of tokens that are available in the fund.

#### &emsp;Parameters
> _exchangeId: You can choose which exchange will be used to trade. If an empty string is passed, it will automatically choose the exchange with the best rates.</br>
  _tokens: ERC20 addresses of the tokens to sell.
  _amounts: The corresponding amount of tokens to sell.
  _minimumRates: The minimum amount of ETH per token in wei.

#### &emsp;Returns
> Whether the function executed successfully or not.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const _exchangeId = 0x0;
const _tokens = ["0x41dee9f481a1d2aa74a3f1d0958c1db6107c686a","0xd7cbe7bfc7d2de0b35b93712f113cae4deff426b"];
const _amounts = [10**17,10**17];
const _minimumRates = [0,0];

fundContract.sellTokens(_exchangeId, _tokens, _amounts, _minimumRates, (err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 4. setManagementFee

```javascript
function setManagementFee(uint _fee) external onlyOwner;
```

#### &emsp;Description
> Set the management fee percentage. This is being calculated with a denominator, so the lowest value is 1 for 0.01%, and the highest value is 10000 for 100%. This is only restricted to be less than 100% (10000). The following example values correspond to the following percentages:</br>
1 = 0.01% fee</br>
10 = 0.1% fee</br>
100 = 1% fee</br>
1000 = 10% fee</br>
10000 = 100% fee</br>

#### &emsp;Parameters
> _fee: The percentage of investor's investment, that will be taken as management fee (Note: _fee must be equal to or bigger than 0 and less than 10000)

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const _fee = 100;
fundContract.setManagementFee(_fee, (err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 5. withdraw

```javascript
function withdraw() external onlyOwnerOrWhitelisted(WhitelistKeys.Maintenance) whenNotPaused returns(bool);
```

#### &emsp;Description
> This function is for fund's manager. Investors that have requested to withdraw their investment will get their investment back after the fund's manager or bot system has executed this function.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);

fundContract.withdraw((err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 6. withdrawFee

```javascript
function withdrawFee(uint amount) external onlyOwner whenNotPaused returns(bool);
```
#### &emsp;Description
> This function is for fund's manager to withdraw fund management fee.

#### &emsp;Parameters
> amount: Amount of management fee the fund manager would like to withdraw.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const amount = 10 ** 17;
fundContract.withdrawFee(amount, (err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 7. enableWhitelist

```javascript
function enableWhitelist(WhitelistKeys _key) external onlyOwner returns(bool);
```
#### &emsp;Description
> Owner of the fund can enable a category of whitelist to facilitate access control for the fund.
The following three categories of whitelist are available:</br>
0: Investment</br>
1: Maintenance </br>
2: Admin</br>
If type 0 Investment whitelist is enabled, only users' addresses that are added to the whitelist are allowed to invest on the fund.
If type 1 Maintenance whitelist is enabled, only users' addresses that have been added to the whitelist are allowed to trigger the withdraw process; otherwise, only the owner of the fund can trigger the withdraw process.
If type 2 Admin whitelist is enabled, only users' addresses that have been added to the whitelist are allowed
to buy and sell tokens for the fund; otherwise, only the owner of the fund can buy and sell tokens.

#### &emsp;Parameters
> \_key: A specific category of whitelist to be enabled for the fund. </br>
The following three keys are available:</br>
0: Investment</br>
1: Maintenance </br>
2: Admin</br>

#### &emsp;Returns
> Whether the function executed successfully or not.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const key = 0; // To enable the Investment whitelist
fundContract.enableWhitelist(key, (err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 8. setAllowed

```javascript
function setAllowed(address[] accounts, WhitelistKeys _key, bool allowed) public onlyOwner returns(bool)
```
#### &emsp;Description
> After enabling a specific category of whitelist, the owner of the fund can add and remove accounts from the whitelist.

#### &emsp;Parameters
> accounts: Array of addresses</br>
> \_key: A specific category of whitelist to be enabled for the fund</br>
> allowed: Set the parameter to true to add accounts to the whitelist; false to remove accounts from the whitelist.

#### &emsp;Returns
> Whether the function executed successfully or not.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const accounts = ['0x7b990738012Dafb67FEa47EC0137842cB582AD71','0x1cD5Fcc6d1d3A2ECdd71473d2FCFE49769643CF2']
const key = 0; // Investment whitelist
const allowed = true;
fundContract.setAllowed(accounts, key, allowed, (err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 9. disableWhitelist

```javascript
function disableWhitelist(WhitelistKeys _key) external onlyOwner returns(bool)
```

#### &emsp;Description
> Owner of the fund can disable a category of whitelist that has been enabled before.

#### &emsp;Parameters
> \_key: A specific category of whitelist to be enabled for the fund. The following three keys are available:</br>
0: Investment</br>
1: Maintenance </br>
2: Admin</br>

#### &emsp;Returns
> Whether the function executed successfully or not.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const key = 0; // To disable the Investment whitelist
fundContract.disableWhitelist(key, (err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

#### 10. close

```javascript
function close() public onlyOwner returns(bool success);
```
#### &emsp;Description
> Close the fund to stop investors from investing on the fund, this function also sells all the tokens to get the ETH back. (Note: After closing the fund, investors can still withdraw their investment and fund managers can also withdraw their management fee.)

#### &emsp;Returns
> Whether the function executed successfully or not.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);

fundContract.close((err, result) => {
  if (err) {
    return console.log(err)
  }
});
```

### abi
> You can get the [abi](http://www.olympus.io/olympusProtocols/fund/abi) from our API.

### bytecode
> You can get the [bytecode](http://www.olympus.io/olympusProtocols/fund/bytecode) from our API.
