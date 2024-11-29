import { Client, AccountId, PrivateKey, Hbar, TransactionId, Transaction, TransferTransaction, TokenCreateTransaction, TokenSupplyType, TransactionReceiptQuery } from "@hashgraph/sdk";
import TokenService from "../tokens/tokenService";

export class TransactionService {
    private client: Client;
    constructor() {
        this.client = process.env.REACT_APP_HEDERA_NETWORK === "mainnet"
            ? Client.forMainnet()
            : Client.forTestnet();

        const HEDERA_ACCOUNT_ID = AccountId.fromString(process.env.REACT_APP_HEDERA_ACCOUNT_ID);
        const HEDERA_PRIVATE_KEY = PrivateKey.fromString(process.env.REACT_APP_HEDERA_PRIVATE_KEY);

        this.client.setOperator( HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY );
    }


    async transactionQuery( transactionId  ) {
        try{
           const transactionReceipt = await new TransactionReceiptQuery()
                .setTransactionId( transactionId )
                .execute( this.client );

            const fullTransactionId = transactionId.toString()
                .replace("@", "-")
                .split('')
                .reverse()
                .join('')
                .replace('.', '-')
                .split('').reverse().join('');

            const hashscanUrl = 'https://hashscan.io/' + process.env.REACT_APP_HEDERA_NETWORK + '/transaction/' + fullTransactionId;


            return {
                tokenId: transactionReceipt.tokenId,
                hashscanUrl: hashscanUrl
            }
        } catch (e) {
            console.error( e );

            return false


        }
    }

}

/**
 * Sample Usage
 *
const hedera = new TransactionService();

(async () => {
    try {
        const tokenTransaction = await hedera.initializeToken("MyToken", "MTK", "A sample token");
        const tokenDetails = await hedera.deployToken(tokenTransaction, hashconnect, initData, pairingData);

        if (tokenDetails) {
            console.log("Token created successfully:", tokenDetails);
        } else {
            console.error("Token creation failed.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
})();
*/
