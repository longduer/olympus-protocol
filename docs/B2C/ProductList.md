# Product List

### Decription
ProductList is a storage that stores all funds and indices. The fund or index will be stored to the ProductList while executing the initialize function. The document serves as guideline to add tokenized cryptocurrency financial products to broaden your application’s product offerings.

### Get the productlistAddress
> To use Product List, first of all, you will have to get the productlistAddress from ComponentList contract.

#### &emsp;Example code
> The code below shows how to get the productlistAddress with Web3.

```javascript
const productlistName = web3.fromAscii('Marketplace');
const componentListContract = web3.eth.contract(abi).at(componentListAddress);
const productlistAddress;
componentListContract.getComponentByName(productlistName,(err, address)=>{
   if (err) {
        return console.error(err);
    }
  productlistAddress = address;
});
```

### Interface

#### 1. getAllProducts

```javascript
function getAllProducts() external view returns (address[] allProducts);
```

#### &emsp;Description
> Call this function to get all products (including fund and index) that are in the product list.

#### &emsp;Example code
> The code below shows how to call this function with Web3.

```javascript
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const productListContract = web3.eth.contract(abi).at(productlistAddress);

productListContract.getAllProducts((err,productAddresses) => {
  if (err) {
    return console.error(err);
  }
  console.log(productAddresses);
  // We can use the following code to distinguish which is index address or fund address.
  const indexContract = web3.eth.contract(indexAbi).at(productAddresses[0])
  indexContract.fundType((err,fundType)=>{
      if (err) {
        return console.error(err);
      }
      if(fundType == 0){
        // This is an index address.
      }else if (fundType == 1){
        // This is a fund address.
      }else{
        // Handle unexpected result.
      }

  })
  // Or
  const fundContract = web3.eth.contract(fundAbi).at(productAddresses[0])
  fundContract.fundType((err,fundType)=>{
      if (err) {
        return console.error(err);
      }
      if(fundType == 0){
        // This is an index address.
      }else if (fundType == 1){
        // This is a fund address.
      }else{
        // Handle unexpected result.
      }
  })
});
```

### abi
> You can get the [abi](http://www.olympus.io/olympusProtocols/marketplace/abi) from our API

### componentList address
> You can get the [componentListAddress](http://www.olympus.io/olympusProtocols/marketplace/abi) from our API
