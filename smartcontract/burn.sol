// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
//Burner Contract. The tokens are sent here before the deployment on SaucerSwap.
import "@hashgraph/sdk/contracts/hts-precompile/HederaTokenService.sol";
import "@hashgraph/sdk/contracts/hts-precompile/IHederaTokenService.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Burn is ReentrancyGuard, Ownable {
    mapping(address => uint256) private tokenBalances;
    bool public paused;

    event TokenReceived(address indexed token, uint256 amount);
    event TokensWithdrawn(address indexed token, uint256 amount);
    event ContractPaused();
    event ContractUnpaused();

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() Ownable() {
        paused = false; // Initialize as not paused
    }

    function receiveToken(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(token != address(0), "Invalid token address");

        int64 balanceBefore = HederaTokenService.getTokenBalance(token, address(this));
        (int responseCode) = HederaTokenService.transferToken(token, msg.sender, address(this), int64(amount));
        require(responseCode == HederaResponseCodes.SUCCESS, "Token transfer failed");

        int64 balanceAfter = HederaTokenService.getTokenBalance(token, address(this));
        uint256 actualAmount = uint256(balanceAfter - balanceBefore);
        tokenBalances[token] += actualAmount;

        emit TokenReceived(token, actualAmount);
    }

    function receiveTokens(address[] calldata tokens, uint256[] calldata amounts) external nonReentrant whenNotPaused {
        require(tokens.length == amounts.length, "Tokens and amounts length mismatch");
        for (uint256 i = 0; i < tokens.length; i++) {
            receiveToken(tokens[i], amounts[i]);
        }
    }

    function withdrawToken(address token, uint256 amount) external nonReentrant onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(tokenBalances[token] >= amount, "Insufficient balance");
        require(token != address(0), "Invalid token address");

        int64 balanceBefore = HederaTokenService.getTokenBalance(token, address(this));
        (int responseCode) = HederaTokenService.transferToken(token, address(this), msg.sender, int64(amount));
        require(responseCode == HederaResponseCodes.SUCCESS, "Token transfer failed");

        int64 balanceAfter = HederaTokenService.getTokenBalance(token, address(this));
        uint256 actualAmount = uint256(balanceBefore - balanceAfter);
        tokenBalances[token] -= actualAmount;

        emit TokensWithdrawn(token, actualAmount);
    }

    function pauseContract() external onlyOwner {
        paused = true;
        emit ContractPaused();
    }

    function unpauseContract() external onlyOwner {
        paused = false;
        emit ContractUnpaused();
    }

    function getTokenBalance(address token) external view returns (uint256) {
        return tokenBalances[token];
    }
}