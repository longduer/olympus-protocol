const Web3 = require("web3");
const web3 = new Web3
(new Web3.providers.HttpProvider("http://localhost:8545"));
// address: deployed fund contract address
const fs = require("fs");

var abi = fs.readFileSync("abi");
console.info(abi);
var address = "0xd607fa77cff17724ecde4e3cda09f16191315a5c";
const fundContract = web3.eth.contract(abi).at(address);
console.info(fundContract);
// Name
// fundContract.name((err, name) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log(name);
// })
// // Symbol
// fundContract.symbol((err, symbol) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log(symbol)
// })
// // Description
// fundContract.description((err, description) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log(description)
// })
// // Category
// fundContract.category((err, category) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log(category)
// })
// // Decimals
// fundContract.decimals((err, decimals) => {
//   if (err) {
//     return console.error(err);
//   }
//   console.log(decimals)
// })
