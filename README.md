# Olympus Labs Protocol Library

[![pipeline status](https://gitlab.com/aireach/olympus-protocol/badges/master/pipeline.svg)](https://gitlab.com/aireach/protocol-architecture/commits/master)

[![coverage report](https://gitlab.com/aireach/olympus-protocol/badges/develop/coverage.svg)](https://gitlab.com/aireach/olympus-protocol/commits/develop)

# Olympus 2.0

- ETH 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

## Test

`npm run test` will test all the suits.

`truffle test --suite=Mockfund ./test/fund/*` Will test a concrete suit, require `./node_modules/.bin/testrpc-sc` started in other terminal.
The suit option will limit the number of deployment required for the concrete test file.

## Kovan

Exchange component:

- KyberNetworkAdapter 0x8b29ce28b9555b02c99a38affb05d5203674e587
- ExchangeAdapterManager 0xb6842dce3e9e00a8e21aaa599c9c2b1c0647ca8a
- ExchangeProvider 0x8bb45686512085d56df444ca35954bff3f4a5862

Marketplace 0xfe818847198201ef8d800809d40f0c504f7d9a8c
AsyncWithdraw 0x186ddb35f59231d972869a6de3334eae410f26a2 // 0x035b67efd86462356d104e52b6975f7d2bfe198c
Reimbursable 0x5b81830a3399f29d1c2567c7d09376503b607058
PercentageFee 0x4dc61e1e74eec68e32538cf2ef5509e17e0fc2bc
Whitelist 0x0f9a12f38233dac6a1f394bd57a69840138b5abd

## Sample Fund

Abel 0x9b3456f18885327b9293673ac107ec9ed96fb463

# Deployed addresses

Market place 0x0e59555df877ac4e634d42f196906c16fe540beb

## Mainnet

### v1.0.0-review-pending

Core: 0xd332692cf20cbc3aa39abf2f2a69437f22e5beb9<br/>
PermissionProvider: 0x402d3bf5d448871810a3ec8a33fb6cc804f9b26e<br/>
ExchangeProvider: 0xcf7de40d32c959c31145e9379c4d5c745bfab45f<br/>
PriceProvider: 0xeacf161734b4e326ca2ba991b8e7872654ad2af4<br/>
StrategyProvider: 0x18c54b043efc6d4c15bdab8a2ce499388b4bf6b3<br/>
WhitelistProvider: 0x73eb1e6ad565e907f486d9fc7a807e50d38ca200<br/>
Storage: 0x9ff1a52be89f728f058cce9f91661260e5614fd1<br/>
ExtendedStorage: 0xDf52c174d6595bceE998A4f751f464D5Ef13f1B5<br/>
ExchangeManager: 0x1bfc5f6ccf99b99388c03773eb65a5d7ca8f1386<br/>
KyberNetworkExchange: 0x71A65496612224077bDB42CA56265F42e65096A7<br/>

### NEW EXCHANGE

ExchangeManager 0x0f7c1afa57b1b4ceb9edc5e89b0091253738cbff<br/>
ExchangeProvider 0x5e0651f6e9c6d867c68b2df60b4d5ec855ca9337<br/>
KyberNetworkExchange 0xe24fe01e5e415556a6a09b61cf9a6fd4a8672650<br/>

### Kyber

0x964F35fAe36d75B1e72770e244F6595B68508CF5 Kyber<br/>
0xD2D21FdeF0D054D2864ce328cc56D1238d6b239e Mainnet Testkyber<br/>

## Kovan

### JUNE 7 version

Core: 0xc7bfb4c0f35d8d42c724a0af1e0f1c6a2a4f60d5<br/>
PermissionProvider: 0x6b7e53420cb313a2a25f7d8835a09c1634285c9a<br/>
ExchangeProvider: 0xa3078A7332bc17f6621fE7B83eE5EB5A788d536a<br/>
PriceProvider: 0x2891330314bbeb473f0d9c1bb81b611ceb15b1d1<br/>
StrategyProvider: 0xf268c97eb57db405091caccaafc1a90f45f2493a<br/>
WhitelistProvider: 0x96ed6cba27c59476921221204e74100903796942<br/>
Storage: 0xa932dbda40579ad4f588b6bbe25811450179fd19<br/>
ExtendedStorage: 0x0c28b67b0a7e48e480a0499dac503dc9335a8c54<br/>
ExchangeManager: 0x85fce64140d4fedf4ce81e2fdfac9c03d7bc0234<br/>
KyberNetworkExchange: 0x69ab4694b7f06f0783a5e651bc75d407323e86ba<br/>

### v1.0.0-review-pending

Core: 0xeEF996Ca4Fe62f826601aE5c1d6fe77d8193513c<br/>
PermissionProvider: 0xdef673F4ecc19fC9439Dd7Ee1f934eE6a35d404C<br/>
ExchangeProvider: 0x7DC3924b9580981A0ad45A76A58C242eD55c03aF<br/>
PriceProvider: 0x3e27CdE65D2CC92F483968efD778d2E8bF047992<br/>
StrategyProvider: 0x484c2bF3c3B986039D1fd7295F07B428F2ae6FA7<br/>
WhitelistProvider: 0xe34c3c550C5b2Ca0a4C29614096A27f7261D3062<br/>
Storage: 0x1a67e378f511a1E5e139bc34FD2955B8D3F45F21<br/>
ExtendedStorage: 0xcEb51bD598ABb0caa8d2Da30D4D760f08936547B<br/>

### Admins

Owner: 0xd7b02e4c876c6920aadfe2b80a73df3ffea44c48<br/>
priceOwner: 0x2576F5EF8309DBB23c39be29D62273B4c917D783<br/>
exchangeOwner: 0xB878496B5a59c9AE84018F9846aB00419Bf0e682<br/>
whitelistOwner: 0xB878496B5a59c9AE84018F9846aB00419Bf0e682<br/>

# Deploy instructions

For more detail, see migrations/deployment.md

## Mainnet

For the mainnet, don't forget to change the MOT address in Core to the mainnet MOT address

## Steps

1.  Deploy Permission Provider and Core using the Permission Providers' address
2.  Use Core and Permission addresses to deploy the rest
3.  Update the configured provider addresses in the core
4.  Update the owners of of the providers
5.  set AddCore to the core address in the permission provider

## Extra Steps

1.  Make sure the orderId in storage is something that's not used before
2.  Add indexes to the strategy provider
3.  Send initial ETH to the exchange part
4.  Configure price provider
