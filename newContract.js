const Web3 = require("web3");
const web3 = new Web3
(new Web3.providers.HttpProvider("http://localhost:8545"));

const name = "";
const symbol = "MOT";
const description = "";
const category = "";
const decimals = 18;

const fs = require("fs");

let abi = fs.readFileSync('abi', 'utf8');
var bytecode = "0x60806040523480156200001157600080fd5b5060405162003a6a38038062003a6a83398101604090815281516020830151918301516060840151608085015160008054600160a060020a0319163317815593860195948501949290920192909190811080159062000071575060128111155b15156200007d57600080fd5b84516200009290600a90602088019062000104565b508351620000a890600b90602087019062000104565b5060038290558251620000c390600290602086019062000104565b507f312e312d3230313831303032000000000000000000000000000000000000000060045560095550506005805461ffff1916600117905550620001a99050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200014757805160ff191683800117855562000177565b8280016001018555821562000177579182015b82811115620001775782518255916020019190600101906200015a565b506200018592915062000189565b5090565b620001a691905b8082111562000185576000815560010162000190565b90565b6138b180620001b96000396000f3006080604052600436106102375763ffffffff60e060020a60003504166306fdde03811461023957806308ecd9a6146102c3578063095ea7b3146102ea57806316ba71971461032257806318160ddd146103375780631fa984061461034c578063200d2ed2146103855780632156e6c6146103aa57806323b872dd146103de5780632feb34d414610408578063313ce5671461042057806333f245b1146104355780633c98d189146104655780633ccfd60b1461053157806343d726d6146105465780634926dc981461055b5780634f64b2be146105705780635075edbf1461058857806353d0f2551461059d57806354fd4d50146105b257806355a3b2c1146105c75780635acf6903146105e85780635f6774041461055b578063659eeabc14610609578063661884631461066e578063679818a1146106925780636e9472981461075e5780636f7bc9be1461077357806370a0823114610794578063715018a6146107b55780637284e416146107ca57806374d16c37146107df5780638d859f3e146107f45780638da5cb5b1461080957806395bc95381461081e57806395d89b411461083957806398d5fdca1461084e578063a9059cbb14610863578063aa6ca80814610887578063b50e44b814610935578063b86ec38f1461094a578063c4d66de81461095f578063d3c9ad1714610980578063d73dd62314610995578063dd62ed3e146109b9578063e8b5e51f146109e0578063ef430aa6146109e8578063f2fde38b146109fd578063f46f16c214610a1e575b005b34801561024557600080fd5b5061024e610a33565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610288578181015183820152602001610270565b50505050905090810190601f1680156102b55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156102cf57600080fd5b506102d8610ac1565b60408051918252519081900360200190f35b3480156102f657600080fd5b5061030e600160a060020a0360043516602435610ae5565b604080519115158252519081900360200190f35b34801561032e57600080fd5b506102d8610b4c565b34801561034357600080fd5b506102d8610b5e565b34801561035857600080fd5b50610361610b65565b6040518082600281111561037157fe5b60ff16815260200191505060405180910390f35b34801561039157600080fd5b5061039a610b6e565b6040518082600381111561037157fe5b3480156103b657600080fd5b506103c2600435610b7c565b60408051600160a060020a039092168252519081900360200190f35b3480156103ea57600080fd5b5061030e600160a060020a0360043581169060243516604435610b9a565b34801561041457600080fd5b506103c2600435610cff565b34801561042c57600080fd5b506102d8610eae565b34801561044157600080fd5b5061030e600435600160a060020a0360243581169060443516606435608435610eb4565b34801561047157600080fd5b5060408051602060046024803582810135848102808701860190975280865261030e96843596369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506111829650505050505050565b34801561053d57600080fd5b5061030e61141e565b34801561055257600080fd5b5061030e6117d3565b34801561056757600080fd5b506102d8611884565b34801561057c57600080fd5b506103c2600435611890565b34801561059457600080fd5b506103c26118b8565b3480156105a957600080fd5b506102d86118c7565b3480156105be57600080fd5b506102d86118eb565b3480156105d357600080fd5b506102d8600160a060020a03600435166118f1565b3480156105f457600080fd5b5061030e600160a060020a0360043516611903565b34801561061557600080fd5b5061061e611918565b60408051602080825283518183015283519192839290830191858101910280838360005b8381101561065a578181015183820152602001610642565b505050509050019250505060405180910390f35b34801561067a57600080fd5b5061030e600160a060020a0360043516602435611a61565b34801561069e57600080fd5b5060408051602060046024803582810135848102808701860190975280865261030e96843596369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750949750611b509650505050505050565b34801561076a57600080fd5b506102d8611e44565b34801561077f57600080fd5b506102d8600160a060020a0360043516611e49565b3480156107a057600080fd5b506102d8600160a060020a0360043516611e5b565b3480156107c157600080fd5b50610237611e76565b3480156107d657600080fd5b5061024e611ee2565b3480156107eb57600080fd5b506102d8611f3a565b34801561080057600080fd5b506102d86121bd565b34801561081557600080fd5b506103c26121e1565b34801561082a57600080fd5b5061030e60ff600435166121f0565b34801561084557600080fd5b5061024e6122fb565b34801561085a57600080fd5b506102d8612356565b34801561086f57600080fd5b5061030e600160a060020a03600435166024356123b4565b34801561089357600080fd5b5061089c612483565b604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b838110156108e05781810151838201526020016108c8565b50505050905001838103825284818151815260200191508051906020019060200280838360005b8381101561091f578181015183820152602001610907565b5050505090500194505050505060405180910390f35b34801561094157600080fd5b506102d861258c565b34801561095657600080fd5b506102d861259e565b34801561096b57600080fd5b50610237600160a060020a03600435166125c2565b34801561098c57600080fd5b506102d861291e565b3480156109a157600080fd5b5061030e600160a060020a0360043516602435612942565b3480156109c557600080fd5b506102d8600160a060020a03600435811690602435166129db565b61030e612a06565b3480156109f457600080fd5b506102d8612c10565b348015610a0957600080fd5b50610237600160a060020a0360043516612c16565b348015610a2a57600080fd5b506102d8612c39565b600a805460408051602060026001851615610100026000190190941693909304601f81018490048402820184019092528181529291830182828015610ab95780601f10610a8e57610100808354040283529160200191610ab9565b820191906000526020600020905b815481529060010190602001808311610a9c57829003601f168201915b505050505081565b7f4c6f636b657250726f766964657200000000000000000000000000000000000081565b336000818152600e60209081526040808320600160a060020a038716808552908352818420869055815186815291519394909390927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925928290030190a35060015b92915050565b60008051602061386683398151915281565b600d545b90565b60055460ff1681565b600554610100900460ff1681565b600081815260016020526040902054600160a060020a03165b919050565b600160a060020a0383166000908152600c6020526040812054821115610bbf57600080fd5b600160a060020a0384166000908152600e60209081526040808320338452909152902054821115610bef57600080fd5b600160a060020a0383161515610c0457600080fd5b600160a060020a0384166000908152600c6020526040902054610c2d908363ffffffff612c5d16565b600160a060020a038086166000908152600c60205260408082209390935590851681522054610c62908363ffffffff612c6f16565b600160a060020a038085166000908152600c60209081526040808320949094559187168152600e82528281203382529091522054610ca6908363ffffffff612c5d16565b600160a060020a038086166000818152600e602090815260408083203384528252918290209490945580518681529051928716939192600080516020613846833981519152929181900390910190a35060019392505050565b60008054600160a060020a03163314610d1757600080fd5b600754604080517ff57ce488000000000000000000000000000000000000000000000000000000008152600481018590529051600160a060020a039092169163f57ce488916024808201926020929091908290030181600087803b158015610d7e57600080fd5b505af1158015610d92573d6000803e3d6000fd5b505050506040513d6020811015610da857600080fd5b5051600160a060020a0316610dbc83610b7c565b600160a060020a03161415610ddb57610dd482610b7c565b9050610b95565b600754604080517ff57ce488000000000000000000000000000000000000000000000000000000008152600481018590529051610e79928592600160a060020a039091169163f57ce488916024808201926020929091908290030181600087803b158015610e4857600080fd5b505af1158015610e5c573d6000803e3d6000fd5b505050506040513d6020811015610e7257600080fd5b5051612c7c565b1515610e8457600080fd5b60008281526008602052604090205460ff161515610ea557610ea582612cd3565b610b4682610b7c565b60095481565b600080548190606090600160a060020a03163314610ed157600080fd5b600160a060020a03871673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee14801590610f1b5750600160a060020a03861673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee14155b1515610f2657600080fd5b610f3d600080516020613826833981519152610b7c565b604080517f095ea7b3000000000000000000000000000000000000000000000000000000008152600160a060020a03808416600483015260006024830181905292519395508a169263095ea7b39260448084019391929182900301818387803b158015610fa957600080fd5b505af1158015610fbd573d6000803e3d6000fd5b5050505086600160a060020a031663095ea7b383876040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050600060405180830381600087803b15801561102457600080fd5b505af1158015611038573d6000803e3d6000fd5b5050604080517f74c6ec74000000000000000000000000000000000000000000000000000000008152600160a060020a038b811660048301528a81166024830152604482018a90526064820189905230608483015260a482018d9052915191861693506374c6ec74925060c4808201926020929091908290030181600087803b1580156110c457600080fd5b505af11580156110d8573d6000803e3d6000fd5b505050506040513d60208110156110ee57600080fd5b505115156110fb57600080fd5b60408051600280825260608201835290916020830190803883390190505090508681600081518110151561112b57fe5b600160a060020a03909216602092830290910190910152805186908290600190811061115357fe5b600160a060020a0390921660209283029091019091015261117381612e58565b50600198975050505050505050565b6000805481908190600160a060020a0316331461119e57600080fd5b5060009050805b845181101561126e57601286828151811015156111be57fe5b90602001906020020151600160a060020a031663313ce5676040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561120557600080fd5b505af1158015611219573d6000803e3d6000fd5b505050506040513d602081101561122f57600080fd5b5051111561123c57600080fd5b611264858281518110151561124d57fe5b60209081029091010151839063ffffffff612c6f16565b91506001016111a5565b303182111561127c57600080fd5b611293600080516020613826833981519152610b7c565b600160a060020a03166315cdc52983888888308d6040518763ffffffff1660e060020a0281526004018080602001806020018060200186600160a060020a0316600160a060020a031681526020018560001916600019168152602001848103845289818151815260200191508051906020019060200280838360005b8381101561132757818101518382015260200161130f565b50505050905001848103835288818151815260200191508051906020019060200280838360005b8381101561136657818101518382015260200161134e565b50505050905001848103825287818151815260200191508051906020019060200280838360005b838110156113a557818101518382015260200161138d565b50505050905001985050505050505050506020604051808303818588803b1580156113cf57600080fd5b505af11580156113e3573d6000803e3d6000fd5b50505050506040513d60208110156113fa57600080fd5b5051151561140757600080fd5b61141086612e58565b506001979650505050505050565b336000908152600c602052604081205481908190819081106114a157604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f496e73756666696369656e742062616c616e6365000000000000000000000000604482015290519081900360640190fd5b6114b8600080516020613866833981519152610b7c565b336000818152600c602090815260408083205481517fc8c01a550000000000000000000000000000000000000000000000000000000081526004810195909552602485015251939650600160a060020a0387169363c8c01a5593604480820194918390030190829087803b15801561152f57600080fd5b505af1158015611543573d6000803e3d6000fd5b505050506040513d602081101561155957600080fd5b5050604080517fc77e761400000000000000000000000000000000000000000000000000000000815290516115ec91600160a060020a0386169163c77e7614916004808201926020929091908290030181600087803b1580156115bb57600080fd5b505af11580156115cf573d6000803e3d6000fd5b505050506040513d60208110156115e557600080fd5b505161302a565b82600160a060020a03166362a5af3b6040518163ffffffff1660e060020a028152600401600060405180830381600087803b15801561162a57600080fd5b505af115801561163e573d6000803e3d6000fd5b5050604080517f51cff8d90000000000000000000000000000000000000000000000000000000081523360048201528151600160a060020a03881694506351cff8d99350602480830193928290030181600087803b15801561169f57600080fd5b505af11580156116b3573d6000803e3d6000fd5b505050506040513d60408110156116c957600080fd5b508051602091820151336000908152600c9093526040909220549093509091506116f9908263ffffffff612c5d16565b336000908152600c6020526040902055600d5461171c908263ffffffff612c5d16565b600d55604051339083156108fc029084906000818181858888f1935050505015801561174c573d6000803e3d6000fd5b5082600160a060020a0316634bb278f36040518163ffffffff1660e060020a028152600401600060405180830381600087803b15801561178b57600080fd5b505af115801561179f573d6000803e3d6000fd5b5050604080518481529051600093503392506000805160206138468339815191529181900360200190a36001935050505090565b60008054600160a060020a031633146117eb57600080fd5b6000600554610100900460ff16600381111561180357fe5b141561180e57600080fd5b61181f670de0b6b3a7640000613091565b6005805461ff00191661030017908190556040517f7ea7eb4c8009de4c3fc0d8b1d8096e2d98fd44dc2cb29bb458efed887fa5617c91610100900460ff16908082600381111561186b57fe5b60ff16815260200191505060405180910390a150600190565b670de0b6b3a764000081565b600680548290811061189e57fe5b600091825260209091200154600160a060020a0316905081565b600754600160a060020a031681565b7f5374657050726f7669646572000000000000000000000000000000000000000081565b60045481565b60106020526000908152604090205481565b60116020526000908152604090205460ff1681565b60606000808281805b60065484101561197d5760006010600060068781548110151561194057fe5b6000918252602080832090910154600160a060020a031683528201929092526040019020541115611972576001909401935b600190930192611921565b846040519080825280602002602001820160405280156119a7578160200160208202803883390190505b50925060009150600090505b600654811015611a57576000601060006006848154811015156119d257fe5b6000918252602080832090910154600160a060020a031683528201929092526040019020541115611a4f576006805482908110611a0b57fe5b6000918252602090912001548351600160a060020a0390911690849084908110611a3157fe5b600160a060020a039092166020928302909101909101526001909101905b6001016119b3565b5090949350505050565b336000908152600e60209081526040808320600160a060020a0386168452909152812054808310611ab557336000908152600e60209081526040808320600160a060020a0388168452909152812055611aea565b611ac5818463ffffffff612c5d16565b336000908152600e60209081526040808320600160a060020a03891684529091529020555b336000818152600e60209081526040808320600160a060020a0389168085529083529281902054815190815290519293927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060019392505050565b6000805481908190600160a060020a03163314611b6c57600080fd5b611b83600080516020613826833981519152610b7c565b9150600090505b8551811015611cdb578581815181101515611ba157fe5b90602001906020020151600160a060020a031663095ea7b38360006040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050600060405180830381600087803b158015611c0e57600080fd5b505af1158015611c22573d6000803e3d6000fd5b505050508581815181101515611c3457fe5b90602001906020020151600160a060020a031663095ea7b3838784815181101515611c5b57fe5b906020019060200201516040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050600060405180830381600087803b158015611cb757600080fd5b505af1158015611ccb573d6000803e3d6000fd5b505060019092019150611b8a9050565b6040517f78265e2f00000000000000000000000000000000000000000000000000000000815230606482018190526084820189905260a060048301908152885160a48401528851600160a060020a038616936378265e2f938b938b938b938f929182916024810191604482019160c401906020808c01910280838360005b83811015611d71578181015183820152602001611d59565b50505050905001848103835288818151815260200191508051906020019060200280838360005b83811015611db0578181015183820152602001611d98565b50505050905001848103825287818151815260200191508051906020019060200280838360005b83811015611def578181015183820152602001611dd7565b5050505090500198505050505050505050602060405180830381600087803b158015611e1a57600080fd5b505af1158015611e2e573d6000803e3d6000fd5b505050506040513d60208110156113fa57600080fd5b303190565b600f6020526000908152604090205481565b600160a060020a03166000908152600c602052604090205490565b600054600160a060020a03163314611e8d57600080fd5b60008054604051600160a060020a03909116917ff8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c6482091a26000805473ffffffffffffffffffffffffffffffffffffffff19169055565b6002805460408051602060018416156101000260001901909316849004601f81018490048402820184019092528181529291830182828015610ab95780601f10610a8e57610100808354040283529160200191610ab9565b600080600080600080600080611f5d600080516020613826833981519152610b7c565b965060009550600090505b6006548110156121b1576006805482908110611f8057fe5b9060005260206000200160009054906101000a9004600160a060020a0316915081600160a060020a031663313ce5676040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015611fde57600080fd5b505af1158015611ff2573d6000803e3d6000fd5b505050506040513d602081101561200857600080fd5b5051604080517f70a082310000000000000000000000000000000000000000000000000000000081523060048201529051919450600160a060020a038416916370a08231916024808201926020929091908290030181600087803b15801561206f57600080fd5b505af1158015612083573d6000803e3d6000fd5b505050506040513d602081101561209957600080fd5b505193508315156120a9576121a9565b604080517f5fc6b623000000000000000000000000000000000000000000000000000000008152600160a060020a03848116600483015273eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee6024830152600a86900a60448301526000606483018190528351918b1693635fc6b623936084808201949293918390030190829087803b15801561213857600080fd5b505af115801561214c573d6000803e3d6000fd5b505050506040513d604081101561216257600080fd5b50519450841515612172576121a9565b6121a6612199600a85900a61218d878963ffffffff6135ba16565b9063ffffffff6135e316565b879063ffffffff612c6f16565b95505b600101611f68565b50939695505050505050565b7f507269636550726f76696465720000000000000000000000000000000000000081565b600054600160a060020a031681565b60008054600160a060020a0316331461220857600080fd5b600082600381111561221657fe5b1415801561223a57506000600554610100900460ff16600381111561223757fe5b14155b151561224557600080fd5b6003600554610100900460ff16600381111561225d57fe5b141580156122775750600382600381111561227457fe5b14155b151561228257600080fd5b6005805483919061ff00191661010083600381111561229d57fe5b02179055506005546040517f7ea7eb4c8009de4c3fc0d8b1d8096e2d98fd44dc2cb29bb458efed887fa5617c91610100900460ff1690808260038111156122e057fe5b60ff16815260200191505060405180910390a1506001919050565b600b805460408051602060026001851615610100026000190190941693909304601f81018490048402820184019092528181529291830182828015610ab95780601f10610a8e57610100808354040283529160200191610ab9565b6000600d54600014156123725750670de0b6b3a7640000610b62565b6123af600d5461218d600954600a0a6123a330600160a060020a031631612397611f3a565b9063ffffffff612c6f16565b9063ffffffff6135ba16565b905090565b336000908152600c60205260408120548211156123d057600080fd5b600160a060020a03831615156123e557600080fd5b336000908152600c6020526040902054612405908363ffffffff612c5d16565b336000908152600c602052604080822092909255600160a060020a03851681522054612437908363ffffffff612c6f16565b600160a060020a0384166000818152600c60209081526040918290209390935580518581529051919233926000805160206138468339815191529281900390910190a350600192915050565b606080606060006006805490506040519080825280602002602001820160405280156124b9578160200160208202803883390190505b509150600090505b60065481101561252357601060006006838154811015156124de57fe5b6000918252602080832090910154600160a060020a03168352820192909252604001902054825183908390811061251157fe5b602090810290910101526001016124c1565b6006828180548060200260200160405190810160405280929190818152602001828054801561257b57602002820191906000526020600020905b8154600160a060020a0316815260019091019060200180831161255d575b505050505091509350935050509091565b60008051602061382683398151915281565b7f5265696d6275727361626c65000000000000000000000000000000000000000081565b6125ca613806565b6000805460609190600160a060020a031633146125e657600080fd5b600160a060020a03841615156125fb57600080fd5b6000600554610100900460ff16600381111561261357fe5b1461261d57600080fd5b612626846135f8565b604080516060810182527f4d61726b657450726f76696465720000000000000000000000000000000000008152600080516020613826833981519152602082015260008051602061386683398151915281830152815160038082526080820190935290945090816020016020820280388339019050509150600090505b60038110156126dd578281600381106126b857fe5b602002015182828151811015156126cb57fe5b602090810290910101526001016126a3565b6007546040517f981f6ab9000000000000000000000000000000000000000000000000000000008152602060048201818152855160248401528551612816948794600160a060020a039091169363981f6ab993869390928392604490910191818601910280838360005b8381101561275f578181015183820152602001612747565b5050505090500192505050600060405180830381600087803b15801561278457600080fd5b505af1158015612798573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405260208110156127c157600080fd5b8101908080516401000000008111156127d957600080fd5b820160208101848111156127ec57600080fd5b815185602082028301116401000000008211171561280957600080fd5b50509291905050506136ea565b5061281f613759565b6128487f4d61726b657450726f7669646572000000000000000000000000000000000000610b7c565b600160a060020a031663dfd92f8a6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561288557600080fd5b505af1158015612899573d6000803e3d6000fd5b505050506040513d60208110156128af57600080fd5b5050600580546001919061ff0019166101008302179055506005546040517f7ea7eb4c8009de4c3fc0d8b1d8096e2d98fd44dc2cb29bb458efed887fa5617c91610100900460ff16908082600381111561290557fe5b60ff16815260200191505060405180910390a150505050565b7f526562616c616e636550726f766964657200000000000000000000000000000081565b336000908152600e60209081526040808320600160a060020a0386168452909152812054612976908363ffffffff612c6f16565b336000818152600e60209081526040808320600160a060020a0389168085529083529281902085905580519485525191937f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929081900390910190a350600192915050565b600160a060020a039182166000908152600e6020908152604080832093909416825291909152205490565b600080806001600554610100900460ff166003811115612a2257fe5b14612a8e57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f5468652046756e64206973206e6f742061637469766500000000000000000000604482015290519081900360640190fd5b66038d7ea4c68000341015612b2957604080517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f4d696e696d756d2076616c756520746f20696e7665737420697320302e30303160448201527f2045544800000000000000000000000000000000000000000000000000000000606482015290519081900360840190fd5b6000600d541115612b7057612b69612b55600d5461218d600954600a0a346135ba90919063ffffffff16565b612b5d612356565b9063ffffffff612c5d16565b9150612b7c565b670de0b6b3a764000091505b612b988261218d600954600a0a346135ba90919063ffffffff16565b336000908152600c6020526040902054909150612bbb908263ffffffff612c6f16565b336000908152600c6020526040902055600d54612bde908263ffffffff612c6f16565b600d5560408051828152905133916000916000805160206138468339815191529181900360200190a360019250505090565b60035481565b600054600160a060020a03163314612c2d57600080fd5b612c3681613789565b50565b7f4d61726b657450726f766964657200000000000000000000000000000000000081565b600082821115612c6957fe5b50900390565b81810182811015610b4657fe5b6000600160a060020a0382161515612c9357600080fd5b5060008281526001602081905260409091208054600160a060020a03841673ffffffffffffffffffffffffffffffffffffffff1990911617905592915050565b600080612cdf83610b7c565b915081600160a060020a031663c642f0946040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015612d1f57600080fd5b505af1158015612d33573d6000803e3d6000fd5b505050506040513d6020811015612d4957600080fd5b5051604080517f095ea7b3000000000000000000000000000000000000000000000000000000008152600160a060020a038581166004830152600060248301819052925193945084169263095ea7b39260448084019391929182900301818387803b158015612db757600080fd5b505af1158015612dcb573d6000803e3d6000fd5b5050604080517f095ea7b3000000000000000000000000000000000000000000000000000000008152600160a060020a03868116600483015260001960248301529151918516935063095ea7b3925060448082019260009290919082900301818387803b158015612e3b57600080fd5b505af1158015612e4f573d6000803e3d6000fd5b50505050505050565b600080805b8351811015613020578381815181101515612e7457fe5b6020908102909101810151604080517f70a082310000000000000000000000000000000000000000000000000000000081523060048201529051919450600160a060020a038516926370a08231926024808401938290030181600087803b158015612ede57600080fd5b505af1158015612ef2573d6000803e3d6000fd5b505050506040513d6020811015612f0857600080fd5b5051600160a060020a0383166000908152601060205260408120829055108015612f4b5750600160a060020a03821660009081526011602052604090205460ff16155b15612fc5576006805460018082019092557ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f01805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0385169081179091556000908152601160205260409020805460ff19169091179055613018565b600160a060020a0382166000818152601060209081526040918290205482519384529083015280517fc2d539e6a806d81b0892f23b002d25b825425d13a98bb6f486438b6b7bc0ce3a9281900390910190a15b600101612e5d565b5060019392505050565b60008061304e600954600a0a61218d613041612356565b869063ffffffff6135ba16565b9150303182111561308c57613081613064611f3a565b61218d670de0b6b3a76400006123a386303163ffffffff612c5d16565b905061308c81613091565b505050565b60608060606000806130a1611918565b945084516040519080825280602002602001820160405280156130ce578160200160208202803883390190505b50935084516040519080825280602002602001820160405280156130fc578160200160208202803883390190505b509250613116600080516020613826833981519152610b7c565b9150600090505b845181101561343d576131e4670de0b6b3a764000061218d878481518110151561314357fe5b6020908102909101810151604080517f70a082310000000000000000000000000000000000000000000000000000000081523060048201529051600160a060020a03909216926370a08231926024808401938290030181600087803b1580156131ab57600080fd5b505af11580156131bf573d6000803e3d6000fd5b505050506040513d60208110156131d557600080fd5b5051899063ffffffff6135ba16565b84828151811015156131f257fe5b602090810290910101528451600160a060020a03831690635fc6b6239087908490811061321b57fe5b9060200190602002015173eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee878581518110151561324857fe5b602090810290910101516040805160e060020a63ffffffff8716028152600160a060020a03948516600482015292909316602483015260448201526000606482018190528251608480840194939192918390030190829087803b1580156132ae57600080fd5b505af11580156132c2573d6000803e3d6000fd5b505050506040513d60408110156132d857600080fd5b506020015183518490839081106132eb57fe5b60209081029091010152845185908290811061330357fe5b90602001906020020151600160a060020a031663095ea7b38360006040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050600060405180830381600087803b15801561337057600080fd5b505af1158015613384573d6000803e3d6000fd5b50505050848181518110151561339657fe5b90602001906020020151600160a060020a031663095ea7b38386848151811015156133bd57fe5b906020019060200201516040518363ffffffff1660e060020a0281526004018083600160a060020a0316600160a060020a0316815260200182815260200192505050600060405180830381600087803b15801561341957600080fd5b505af115801561342d573d6000803e3d6000fd5b50506001909201915061311d9050565b81600160a060020a03166378265e2f8686863060006040518663ffffffff1660e060020a0281526004018080602001806020018060200186600160a060020a0316600160a060020a0316815260200185600102600019168152602001848103845289818151815260200191508051906020019060200280838360005b838110156134d15781810151838201526020016134b9565b50505050905001848103835288818151815260200191508051906020019060200280838360005b838110156135105781810151838201526020016134f8565b50505050905001848103825287818151815260200191508051906020019060200280838360005b8381101561354f578181015183820152602001613537565b5050505090500198505050505050505050602060405180830381600087803b15801561357a57600080fd5b505af115801561358e573d6000803e3d6000fd5b505050506040513d60208110156135a457600080fd5b505115156135b157600080fd5b612e4f85612e58565b60008215156135cb57506000610b46565b508181028183828115156135db57fe5b0414610b4657fe5b600081838115156135f057fe5b049392505050565b600160a060020a038116151561360d57600080fd5b6007805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a039290921691909117905560086020527f71177b64f3e7ddf2c165ea5460a42160a62ae572ba241026ebb1760a38682dd4805460ff1990811660019081179092557f69edd6aae9035c32d00f6094c8ed56f04634b828de2b290922284ae9e6d62e2080548216831790557f4c6f636b657250726f76696465720000000000000000000000000000000000006000527f3b8abf76a2f4d22e165813ad51169c30c0a1d3f9faceb0ba7ea8aedfbf4465b180549091169091179055565b600080825184511415156136fd57600080fd5b835160001061370b57600080fd5b5060005b835181101561302057613750848281518110151561372957fe5b90602001906020020151848381518110151561374157fe5b90602001906020020151612c7c565b5060010161370f565b613770600080516020613826833981519152612cd3565b613787600080516020613866833981519152612cd3565b565b600160a060020a038116151561379e57600080fd5b60008054604051600160a060020a03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a36000805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b6060604051908101604052806003906020820280388339509192915050560045786368616e676550726f766964657200000000000000000000000000000000ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef576974686472617750726f766964657200000000000000000000000000000000a165627a7a7230582038ab5268486420840539f9c6abe58f1753f63963648b87f254e3c871aa41be760029";
// Get gas price
var gasPrice;
web3.eth.getGasPrice
((err, price) => {
  if (err) {
    return console.error(err);
  }
  gasPrice = price;
  console.info(gasPrice);
});

// Get gas limit
let gasLimit;

const data = web3.eth.contract(abi).new.getData({
  name,
  symbol,
  description,
  category,
  decimals,
  data: new Buffer(bytecode, 'utf8')
});



web3.eth.estimateGas(data, (err, gas) => {
  if (err) {
    return console.error(err);
  }
  gasLimit = gas;
});

// Deploy and get fund contract address
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
  (err, newFund) => {
    if (err) {
      return console.error(err);
    }
    if (newFund && newFund.address) {
      // Now the fund is deployed, you can get the fund contract address.
      console.log(newFund.address)
    }
  });
