// src/classes/TokenLaunch.js

const {
    Client,
    TokenCreateTransaction,
    AccountId,
    PrivateKey,
    Hbar
} = require("@hashgraph/sdk"); // Import the necessary Hedera SDK classes
require("dotenv").config(); // Load environment variables from the .env file

class TokenLaunch {
    /**
     * Constructor to initialize the TokenLaunch class with configuration parameters.
     * @param {Object} config - Configuration object containing token details and network info.
     */
    constructor(config) {
        this.config = config;
        this.client = this.initializeClient(config.network); // Initialize the Hedera client based on the network
    }

    /**
     * Initializes the Hedera Client based on the specified network.
     * @param {string} network - The Hedera network to connect to ('mainnet', 'testnet', or 'previewnet').
     * @returns {Client} - The Hedera Client object configured for the specified network.
     */
    initializeClient(network) {
        let client;
        // Select the appropriate network
        if (network === "mainnet") {
            client = Client.forMainnet();
        } else if (network === "testnet") {
            client = Client.forTestnet();
        } else if (network === "previewnet") {
            client = Client.forPreviewnet();
        } else {
            throw new Error("Invalid Hedera network specified"); // Error handling for invalid network input
        }
        // Set the operator (your account) for the client using credentials from environment variables
        client.setOperator(
            AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
            PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
        );
        return client; // Return the configured client
    }

    /**
     * Initializes the token creation transaction with the specified parameters.
     * This method prepares the transaction but does not execute it.
     */
    async initializeToken() {
        try {
            // Create a new TokenCreateTransaction with the provided config parameters
            const transaction = new TokenCreateTransaction()
                .setTokenName(this.config.name) // Set the token name
                .setTokenSymbol(this.config.symbol) // Set the token symbol
                .setTreasuryAccountId(AccountId.fromString(this.config.treasuryAccountId)) // Set the treasury account ID
                .setMaxSupply(this.config.totalSupply) // Set the maximum supply of the token
                .setInitialSupply(this.config.totalSupply) // Set the initial supply of the token
                .setDecimals(this.config.decimals) // Set the number of decimals for the token
                .setTokenMemo(this.config.memo) // Set an optional memo for the token
                .setMaxTransactionFee(new Hbar(30)); // Set a max transaction fee in Hbar

            this.transaction = transaction; // Store the transaction for later execution
        } catch (error) {
            console.error("Error initializing token: ", error); // Log any errors that occur during initialization
            throw error; // Re-throw the error to ensure it's handled by the caller
        }
    }

    /**
     * Deploys the token by executing the prepared token creation transaction.
     * @returns {Promise<string>} - The ID of the newly created token.
     */
    async deployToken() {
        try {
            // Execute the token creation transaction
            const response = await this.transaction.execute(this.client);
            // Get the receipt of the transaction to confirm the token creation
            const receipt = await response.getReceipt(this.client);
            console.log(`Token created with ID: ${receipt.tokenId}`); // Log the token ID upon successful creation
            return receipt.tokenId; // Return the token ID
        } catch (error) {
            console.error("Error deploying token: ", error); // Log any errors that occur during deployment
            throw error; // Re-throw the error to ensure it's handled by the caller
        }
    }
}

module.exports = TokenLaunch; // Export the TokenLaunch class for use in other parts of the application
