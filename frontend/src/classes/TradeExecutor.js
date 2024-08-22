// src/classes/TradeExecutor.js

const {
    TransferTransaction,
    AccountId,
    TokenId,
    PrivateKey,
    Hbar
} = require("@hashgraph/sdk");

class TradeExecutor {
    /**
     * Constructor to initialize the TradeExecutor class.
     * @param {BondingCurve} bondingCurve - An instance of the BondingCurve class.
     * @param {Object} config - Configuration object containing necessary keys and IDs.
     */
    constructor(bondingCurve, config) {
        this.bondingCurve = bondingCurve; // Store the BondingCurve instance
        this.client = config.client; // Hedera client for executing transactions
        this.tokenId = TokenId.fromString(config.tokenId); // The token ID for token X
        this.treasuryAccountId = AccountId.fromString(config.treasuryAccountId); // Treasury account ID
        this.treasuryPrivateKey = PrivateKey.fromString(config.treasuryPrivateKey); // Treasury private key
        this.feeAccountId = AccountId.fromString(config.feeAccountId); // Account to collect the transaction fee
    }

    /**
     * Execute a buy transaction, transferring token Y from buyer to treasury, and token X from treasury to buyer.
     * The fee is already accounted for by the BondingCurve class.
     * @param {AccountId} buyerAccountId - The account ID of the buyer.
     * @param {number} amountY - The amount of token Y (Hbar) to spend.
     * @param {PrivateKey} buyerPrivateKey - The private key of the buyer for signing the transaction.
     * @returns {Object} - The result of the transaction including final price, amount of token X received, and slippage.
     * @throws {Error} - If the purchase would exceed allowed token limits.
     */
    async executeBuy(buyerAccountId, amountY, buyerPrivateKey) {
        const buyerId = AccountId.fromString(buyerAccountId);
        
        try {
            // Simulate the buy to get the amount of token X and check for max supply limits
            const { finalPrice, amountX, slippage } = this.bondingCurve.simulateBuy(amountY);

            // Create a transaction to transfer Hbar (Y) from buyer to treasury
            const transferTx = new TransferTransaction()
                .addHbarTransfer(buyerId, new Hbar(-amountY)) // Buyer pays amountY Hbar
                .addHbarTransfer(this.treasuryAccountId, new Hbar(amountY)) // Treasury receives amountY Hbar
                .addTokenTransfer(this.tokenId, this.treasuryAccountId, -amountX) // Treasury sends amountX of token X
                .addTokenTransfer(this.tokenId, buyerId, amountX) // Buyer receives amountX of token X
                .freezeWith(this.client);

            // Sign the transaction with both the buyer's and treasury's private keys
            const signedTx = await (await transferTx.sign(buyerPrivateKey)).sign(this.treasuryPrivateKey);

            const txResponse = await signedTx.execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);

            if (receipt.status.toString() === "SUCCESS") {
                return { finalPrice, amountX, slippage };
            } else {
                throw new Error("Transaction failed");
            }
        } catch (error) {
            console.error("Error executing buy transaction: ", error);
            throw error;
        }
    }

    /**
     * Execute a sell transaction, transferring token X from seller to treasury, and token Y (Hbar) from treasury to seller.
     * The fee is already accounted for by the BondingCurve class.
     * @param {AccountId} sellerAccountId - The account ID of the seller.
     * @param {number} amountX - The amount of token X to sell.
     * @param {PrivateKey} sellerPrivateKey - The private key of the seller for signing the transaction.
     * @returns {Object} - The result of the transaction including final price, amount of token Y received, and slippage.
     */
    async executeSell(sellerAccountId, amountX, sellerPrivateKey) {
        const sellerId = AccountId.fromString(sellerAccountId);
        
        try {
            // Simulate the sell to get the amount of token Y (Hbar)
            const { finalPrice, amountY, slippage } = this.bondingCurve.simulateSell(amountX);

            // Create a transaction to transfer token X from seller to treasury, and Hbar (Y) from treasury to seller
            const transferTx = new TransferTransaction()
                .addTokenTransfer(this.tokenId, sellerId, -amountX) // Seller sends amountX of token X
                .addTokenTransfer(this.tokenId, this.treasuryAccountId, amountX) // Treasury receives amountX of token X
                .addHbarTransfer(this.treasuryAccountId, new Hbar(-amountY)) // Treasury sends amountY Hbar
                .addHbarTransfer(sellerId, new Hbar(amountY)) // Seller receives amountY Hbar
                .freezeWith(this.client);

            // Sign the transaction with both the seller's and treasury's private keys
            const signedTx = await (await transferTx.sign(sellerPrivateKey)).sign(this.treasuryPrivateKey);

            const txResponse = await signedTx.execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);

            if (receipt.status.toString() === "SUCCESS") {
                return { finalPrice, amountY, slippage };
            } else {
                throw new Error("Transaction failed");
            }
        } catch (error) {
            console.error("Error executing sell transaction: ", error);
            throw error;
        }
    }
}

module.exports = TradeExecutor;
