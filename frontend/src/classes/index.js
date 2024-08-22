// src/index.js

const {
    Client,
    AccountId,
    PrivateKey,
} = require("@hashgraph/sdk");
const TokenLaunch = require('./TokenLaunch');
const BondingCurve = require('./BondingCurve');
const TradeExecutor = require('./TradeExecutor');
require('dotenv').config();

(async () => {
    try {
        // Initialize Hedera Client
        const client = Client.forName(process.env.HEDERA_NETWORK)
            .setOperator(
                AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
                PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
            );

        // Token Configuration
        const tokenConfig = {
            name: "FairToken",
            symbol: "FTK",
            totalSupply: 700000000000000000000000000, // 700 million tokens with 18 decimals
            decimals: 18,
            treasuryAccountId: process.env.HEDERA_TREASURY_ID,
            treasuryPrivateKey: process.env.HEDERA_TREASURY_KEY,
            memo: "Fair Token Launch",
            network: process.env.HEDERA_NETWORK
        };

        // Step 1: Launch the Token
        const tokenLaunch = new TokenLaunch(tokenConfig);
        await tokenLaunch.initializeToken();
        const tokenId = await tokenLaunch.deployToken();
        console.log(`Token deployed with ID: ${tokenId}`);

        // Step 2: Initialize the BondingCurve with the initial supply and liquidity
        const initialSupply = 700000000000000000000000000; // 700 million tokens with 18 decimals
        const initialLiquidity = 34300; // Initial liquidity in Hbar
        const bondingCurve = new BondingCurve(initialSupply, initialLiquidity);

        // Step 3: Configure TradeExecutor
        const tradeConfig = {
            client: client,
            tokenId: tokenId.toString(),
            treasuryAccountId: process.env.HEDERA_TREASURY_ID,
            treasuryPrivateKey: process.env.HEDERA_TREASURY_KEY,
            feeAccountId: process.env.HEDERA_FEE_ACCOUNT_ID
        };
        const tradeExecutor = new TradeExecutor(bondingCurve, tradeConfig);



        // Step 5: Execute a Sell Transaction
        const sellerId = "0.0.BBBBBB"; // Replace with the seller's account ID
        const sellerPrivateKey = PrivateKey.fromString("302e020100300506032b657004220420..."); // Replace with the seller's private key
        const amountX = 500; // The amount of token X to sell
        const sellResult = await tradeExecutor.executeSell(sellerId, amountX, sellerPrivateKey);
        console.log("Sell Transaction Result:", sellResult);

    } catch (error) {
        console.error("Error during token lifecycle operations:", error);
    }
})();
