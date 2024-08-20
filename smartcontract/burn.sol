
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@hashgraph/sdk/contracts/hts-precompile/HederaTokenService.sol";
import "@hashgraph/sdk/contracts/hts-precompile/IHederaTokenService.sol";

contract HederaBurnerContract is HederaTokenService {
    address public immutable owner;
    mapping(address => int64) private tokenBalances;
    address[] private tokenList;

    event TokenReceived(address indexed token, int64 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function receiveToken(address _token, int64 _amount) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(_amount > 0, "Amount must be greater than 0");

        int64 balanceBefore = getTokenBalance(_token);
        
        (int responseCode, ) = HederaTokenService.associateToken(address(this), _token);
        require(responseCode == HederaResponseCodes.SUCCESS, "Token association failed");

        (responseCode) = HederaTokenService.transferToken(_token, msg.sender, address(this), _amount);
        require(responseCode == HederaResponseCodes.SUCCESS, "Token transfer failed");

        int64 balanceAfter = getTokenBalance(_token);
        int64 actualAmount = balanceAfter - balanceBefore;

        if (tokenBalances[_token] == 0) {
            tokenList.push(_token);
        }
        tokenBalances[_token] += actualAmount;

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

    receive() external payable {
        revert("This contract does not accept HBAR");
    }

    fallback() external payable {
        revert("This contract does not accept HBAR");
    }
}
