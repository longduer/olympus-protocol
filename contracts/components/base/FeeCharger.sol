pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../../interfaces/DerivativeInterface.sol";
import "../../libs/ERC20Extended.sol";


contract FeeCharger is Ownable {
    FeeMode public feeMode = FeeMode.ByCalls;
    uint public feePercentage = 0;
    uint public feeAmount = 0;
    uint constant public DENOMINATOR = 10000;
    address private olympusWallet = 0x09227deaeE08a5Ba9D6Eb057F922aDfAd191c36c;
    // TODO: change this to mainnet MOT address before deployment.
    // solhint-disable-next-line
    ERC20Extended private MOT = ERC20Extended(0x41Dee9F481a1d2AA74a3f1d0958C1dB6107c686A);

    enum FeeMode {
        ByTransactionAmount,
        ByCalls
    }

    modifier feePayable(uint _amount) {
      uint fee = calculateFee(_amount);
      DerivativeInterface derivative = DerivativeInterface(msg.sender);
      require(MOT.balanceOf(derivative.owner()) >= fee);
      _;
    }

    /*
     * @dev Pay the fee for the call / transaction.
     * Depending on the component itself, the fee is paid differently.
     * @param uint _amountinMot The base amount in MOT, calculation should be one outside. 
     * this is only used when the fee mode is by transaction amount.
     * @return boolean whether or not the fee is paid.
     */
    function payFee(uint _amountinMOT) external feePayable(_amountinMOT) returns (bool success) {
        uint amount = calculateFee(_amountinMOT);

        DerivativeInterface derivative = DerivativeInterface(msg.sender);
        address owner = derivative.owner();        

        if (MOT.allowance(owner, olympusWallet) < amount) {
            MOT.approve(olympusWallet, amount);
        }

        require(MOT.allowance(owner, olympusWallet) >= amount);

        uint balanceBefore = MOT.balanceOf(olympusWallet);
        MOT.transferFrom(owner, olympusWallet, amount);
        uint balanceAfter = MOT.balanceOf(olympusWallet);

        require(balanceAfter == balanceBefore + amount);   
        return true;     
    }    

    function calculateFee(uint _amount) public view returns (uint amount) {
        uint fee;
        if (feeMode == FeeMode.ByTransactionAmount) {
            fee = _amount * DENOMINATOR / feePercentage;
        } else if (feeMode == FeeMode.ByCalls) {
            fee = feeAmount;
        } else {
          revert("Unsupported fee mode.");
        }

        return fee;
    }    

    function adjustFeeMode(FeeMode _newMode) public onlyOwner returns (bool success) {
        feeMode = _newMode;
        return true;
    }

    function adjustFeeAmount(uint _newAmount) public onlyOwner returns (bool success) {
        feeAmount = _newAmount;
        return true;
    }    

    function adjustFeePercentage(uint _newPercentage) public onlyOwner returns (bool success) {
        require(_newPercentage <= DENOMINATOR);
        feePercentage = _newPercentage;
        return true;
    }    

    function setWalletId(address _newWallet) public onlyOwner returns (bool success) {
        require(_newWallet != 0x0);
        olympusWallet = _newWallet;
        return true;
    }

    function setMotAddress(address _motAddress) public onlyOwner returns (bool success) {
        require(_motAddress != 0x0);
        require(_motAddress != address(MOT));
        MOT = ERC20Extended(_motAddress);

        return true;
    }
}
