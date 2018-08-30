Basic Fund
==========

### Introduction

A cryptocurrency fund is a vehicle that allows an investment manager to pool together ETH from investors for the purpose of investing while having the investors retain control of their ETH. The Olympus Basic Fund contains the basic interfaces that a fund needs. This document walks you through the functions of the basic fund (created by the Olympus team) that are targeted at investors.

### Basic info

> The code below shows how to get fund's basic information, including fund's name, symbol, description, category and decimals.

``` {.sourceCode .javascript}
const Web3 = require("web3");
const web3 = new Web3
(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
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
console.log(symbol);
})
// Description
fundContract.description((err,description)=>{
if (err) {
  return console.error(err);
}
console.log(description);
})
// Category
fundContract.category((err,category)=>{
if (err) {
  return console.error(err);
}
console.log(category);
})
// Decimals
fundContract.decimals((err,decimals)=>{
if (err) {
  return console.error(err);
}
console.log(decimals);
})
```

### Interface

1. invest
---------

``` {.sourceCode .javascript}
function invest() public
      payable
    returns(bool)
```

####  Description

> Invest in the fund by calling the invest function while sending Ether to the fund.

####  Returns

> Whether the function executed successfully or not.

####  Example code

> The code below shows how to call this function with Web3.

``` {.sourceCode .javascript}
const Web3 = require("web3");
const web3 = new Web3
(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);
const investAmount = 1 ** 17;
fundContract.invest({value: investAmount}, (err, result) => {
if (err) {
  return console.log(err)
}
});
```

2. withdraw
-----------

``` {.sourceCode .javascript}
function withdraw() external returns(bool);
```

####  Description

> This function is for investors to withdraw all of their investment.

####  Returns

> Whether the function executed successfully or not.

####  Example code

> The code below shows how to call this function with Web3.

``` {.sourceCode .javascript}
const Web3 = require("web3");
const web3 = new Web3
(new Web3.providers.HttpProvider("http://localhost:8545"));
const fundContract = web3.eth.contract(abi).at(address);

fundContract.withdraw((err, result) => {
if (err) {
  return console.log(err)
}
});
```

### abi

> You can get the [abi](../api.html) from our API
