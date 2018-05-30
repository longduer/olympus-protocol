pragma solidity ^0.4.23;

import "./libs/ERC20.sol";

contract RebalancePseudo {
    enum RebalanceStatus {
        INACTIVE,
        INITIATED,
        READYTOTRADE,
        SELLINGCOMPLETE,
        BUYINGINPROGRESS,
        BUYINGCOMPLETE
    }
    RebalanceStatus private rebalanceStatus = RebalanceStatus.INACTIVE;
    address constant private ETH_TOKEN = 0xeeeeeeeeeeeeeeeeee;
    uint private TOKEN_STEP = 10;
    uint private rebalancingTokenProgress;
    uint private PERCENTAGE_DENOMINATOR = 10000;
    uint private rebalanceDeltaPercentage = 30; // 0.3%
    uint private lastRebalance = 1000000000;
    uint private rebalanceInterval = 1000;
    uint private ethValueRebalanceStart;

    // We want to see the difference between the balance in ETH before and after tokens are sold
    uint private rebalanceSoldTokensETHReceived;
    uint totalIndexValue = 3000000000000;
    address[] private tokenAddresses = [
        0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0
    ];
    uint[] private tokenWeights = [
        1, 5, 4, 5, 11, 5, 2, 8, 9, 5, 10, 15, 5, 5, 10
    ];

    struct RebalanceToken {
        address tokenAddress;
        uint tokenWeight;
        uint amount;
    }

    RebalanceToken[] private rebalanceTokensToSell;
    RebalanceToken[] private rebalanceTokensToBuy;

    constructor() public {
    }

    function rebalance() public returns (bool success){
        // solium-disable-next-line security/no-block-members
        require(lastRebalance + rebalanceInterval < now);
        if(rebalanceStatus == RebalanceStatus.INACTIVE){
            ethValueRebalanceStart = address(this).balance;
            delete rebalanceTokensToSell;
            delete rebalanceTokensToBuy;
            rebalanceStatus = RebalanceStatus.INITIATED;
        }
        uint i;
        uint currentProgress = rebalancingTokenProgress;

        if(rebalanceStatus == RebalanceStatus.INITIATED){
            for(i = 0; i < tokenAddresses.length; i++) {
                uint ETHTokenPrice = mockCoreGetPrice(tokenAddresses[i]);
                uint currentTokenBalance = ERC20(tokenAddresses[i]).balanceOf(address(this));
                uint shouldHaveAmountOfTokensInETH = (totalIndexValue / 100) * tokenWeights[i];
                uint shouldHaveAmountOfTokens = (shouldHaveAmountOfTokensInETH * ETHTokenPrice) / 10**18;
                // minus delta
                if (shouldHaveAmountOfTokens < (currentTokenBalance - (currentTokenBalance * rebalanceDeltaPercentage / PERCENTAGE_DENOMINATOR))){
                    rebalanceTokensToSell.push(RebalanceToken({
                        tokenAddress: tokenAddresses[i],
                        tokenWeight: tokenWeights[i],
                        amount: currentTokenBalance - shouldHaveAmountOfTokens
                    }));
                } else if (shouldHaveAmountOfTokens > (currentTokenBalance + (currentTokenBalance * rebalanceDeltaPercentage / PERCENTAGE_DENOMINATOR))){
                    rebalanceTokensToBuy.push(RebalanceToken({
                        tokenAddress: tokenAddresses[i],
                        tokenWeight: tokenWeights[i],
                        amount: shouldHaveAmountOfTokensInETH - (currentTokenBalance * (10**ERC20(tokenAddresses[i]).decimals()) / ETHTokenPrice)
                    }));
                }
            //TODO Does this run out of gas for 100 tokens?
            }
            rebalanceStatus = RebalanceStatus.READYTOTRADE;
        }

        if(rebalanceStatus == RebalanceStatus.READYTOTRADE){
            // First sell tokens
            for(i = currentProgress; i < rebalanceTokensToSell.length; i++){
                if(i > currentProgress + TOKEN_STEP){
                    return false;
                }
                // TODO approve token transfers (depending on exchange implementation)
                require(mockCoreExchange(rebalanceTokensToSell[i].tokenAddress,ETH_TOKEN,rebalanceTokensToSell[i].amount));
                rebalancingTokenProgress++;
                if(i == rebalanceTokensToSell.length - 1){
                    rebalanceStatus = RebalanceStatus.SELLINGCOMPLETE;
                }
            }
        }


        if(rebalanceStatus == RebalanceStatus.SELLINGCOMPLETE){
            rebalanceSoldTokensETHReceived = address(this).balance - ethValueRebalanceStart;
            rebalanceStatus = RebalanceStatus.BUYINGINPROGRESS;
        }

        // Then buy tokens
        if(rebalanceStatus == RebalanceStatus.BUYINGINPROGRESS){
            uint sellTxs = rebalancingTokenProgress - currentProgress;
            rebalancingTokenProgress = 0;
            uint assumedAmountOfEthToBuy;
            uint differencePercentage;
            bool surplus;

            // Get the total amount of ETH that we are supposed to buy
            for(i = 0; i < rebalanceTokensToBuy.length; i++){
                assumedAmountOfEthToBuy += rebalanceTokensToBuy[i].amount;
            }
            // Based on the actual amount of received ETH for sold tokens, calculate the difference percentage, so this can be used
            if(assumedAmountOfEthToBuy > rebalanceSoldTokensETHReceived){
                differencePercentage = ((assumedAmountOfEthToBuy - rebalanceSoldTokensETHReceived) * PERCENTAGE_DENOMINATOR) / assumedAmountOfEthToBuy;
            } else if (assumedAmountOfEthToBuy < rebalanceSoldTokensETHReceived){
                surplus = true;
                differencePercentage = ((rebalanceSoldTokensETHReceived - assumedAmountOfEthToBuy) * PERCENTAGE_DENOMINATOR) / rebalanceSoldTokensETHReceived;
            } else {
                differencePercentage = 0;
            }

            for(i = rebalancingTokenProgress; i < rebalanceTokensToBuy.length; i++){
                if(i + sellTxs > currentProgress + TOKEN_STEP){
                    return false;
                }
                uint slippage;
                if(differencePercentage > 0){
                    slippage = (rebalanceTokensToBuy[i].amount * differencePercentage) / PERCENTAGE_DENOMINATOR;
                }
                if(surplus == true){
                    require(mockCoreExchange(ETH_TOKEN,rebalanceTokensToBuy[i].tokenAddress,rebalanceTokensToBuy[i].amount + slippage));
                } else {
                    require(mockCoreExchange(ETH_TOKEN,rebalanceTokensToBuy[i].tokenAddress,rebalanceTokensToBuy[i].amount - slippage));
                }
                rebalancingTokenProgress++;
                if(i == rebalanceTokensToBuy.length - 1){
                    rebalanceStatus = RebalanceStatus.BUYINGCOMPLETE;
                }
            }

        }

        if(rebalanceStatus == RebalanceStatus.BUYINGCOMPLETE){
            // solium-disable-next-line security/no-block-members
            lastRebalance = now;
            rebalanceStatus = RebalanceStatus.INACTIVE;
            rebalancingTokenProgress = 0;
            return true;
        }
        return false;
    }

    function resetRebalance() public returns(bool) {
        rebalanceStatus = RebalanceStatus.INACTIVE;
        rebalancingTokenProgress = 0;
        return true;
    }

    function updateTokensPerRebalance(uint tokenAmount) public returns(bool){
        require(tokenAmount > 0);
        TOKEN_STEP = tokenAmount;
        return true;
    }

    function mockCoreGetPrice(address _tokenAddress) public pure returns (uint) {
        if(_tokenAddress != address(0x213)){
            // return the expected result for a 1 ETH trade
            return 10000000000000000;
        }
    }

    function mockCoreExchange(address _src, address _dest, uint _amount) public pure returns (bool){
        if(_src != address(0x213) && _dest != address(0x213) && _amount > 0){
            return true;
        }
        return false;
    }

}
