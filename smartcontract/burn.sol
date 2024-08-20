// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@hashgraph/sdk/contracts/hts-precompile/HederaTokenService.sol";
import "@hashgraph/sdk/contracts/hts-precompile/IHederaTokenService.sol";

/* This contract is the burn address for the product. The ./backend folder has the product logic implementation using hedera sdk */

contract HederaBurnerContract is HederaTokenService {
    mapping(address => bool) public acceptedTokens;
    address[] private tokenList;

    event TokenReceived(address indexed token, int64 amount);
    event TokenAccepted(address indexed token);

    constructor() {
        
    }

    function acceptToken(address _token) external  {
        require(_token != address(0), "Invalid token address");
        require(!acceptedTokens[_token], "Token already accepted");

        (int responseCode, ) = HederaTokenService.associateToken(address(this), _token);
        require(responseCode == HederaResponseCodes.SUCCESS, "Token association failed");

        acceptedTokens[_token] = true;
        tokenList.push(_token);

        emit TokenAccepted(_token);
    }

    function receiveToken(address _token, int64 _amount) external onlyOwner {
        require(acceptedTokens[_token], "Token not accepted");
        require(_amount > 0, "Amount must be greater than 0");

        int64 balanceBefore = getTokenBalance(_token);
        
        (int responseCode) = HederaTokenService.transferToken(_token, msg.sender, address(this), _amount);
        require(responseCode == HederaResponseCodes.SUCCESS, "Token transfer failed");

        int64 balanceAfter = getTokenBalance(_token);
        int64 actualAmount = balanceAfter - balanceBefore;

        emit TokenReceived(_token, actualAmount);
    }

    function getTokenList() external view returns (address[] memory) {
        return tokenList;
    }

    function getTokenBalance(address _token) public view returns (int64) {
        (int responseCode, uint256 balance, , ) = HederaTokenService.getTokenInfo(_token);
        require(responseCode == HederaResponseCodes.SUCCESS, "Failed to get token info");
        return int64(uint64(balance));
    }

  
}
