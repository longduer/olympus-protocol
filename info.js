const Web3 = require("web3");
const fs = require("fs");

const web3 = new Web3
(new Web3.providers.HttpProvider("http://localhost:8545"));

var address = "";

let abi = fs.readFileSync('abi', 'utf8');// address: deployed fund contract address
const fundContract = web3.eth.contract(abi).at(address);
// Name
fundContract.name((err, name) => {
  if (err) {
    return console.error(err);
  }
  console.log(name);
})
// Symbol
fundContract.symbol((err, symbol) => {
  if (err) {
    return console.error(err);
  }
  console.log(symbol)
})
// Description
fundContract.description((err, description) => {
  if (err) {
    return console.error(err);
  }
  console.log(description)
})
// Category
fundContract.category((err, category) => {
  if (err) {
    return console.error(err);
  }
  console.log(category)
})
// Decimals
fundContract.decimals((err, decimals) => {
  if (err) {
    return console.error(err);
  }
  console.log(decimals)
})
