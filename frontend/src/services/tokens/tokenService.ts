
import {
    AccountId,
    Hbar,
    TokenCreateTransaction,
    TokenSupplyType,
    TransactionReceiptQuery,
    TransferTransaction
} from "@hashgraph/sdk";
import {WalletInterface} from "../wallets/walletInterface";
import {TransactionService} from "../transactions/transactionService";
import ToastsService from "../toasts/toastsService";
import BondingCurve from "../../classes/BondingCurve";

class TokenService {
    private accountId: AccountId;
    private walletInterface: WalletInterface;

    constructor( accountId: AccountId, walletInterface: WalletInterface ) {
        this.accountId = accountId; // Initialize the accountId property
        this.walletInterface = walletInterface; // Initialize the walletInterface property
    }

    /**
     * Deploy a token and return token details
     */
    async deployToken( name: string, symbol: string, memo: string, description: string) {
        try {
            const transactionId = await this
                .walletInterface
                .executeTokenCreateTransaction( name, symbol, memo );

            if( ! transactionId  ){
                return false;
            }

            const tokenData = await new TransactionService()
                .transactionQuery( transactionId );

            if( ! tokenData ){
                return false;
            }


            /**
             * Get Bonding Curve Details
             */
            const bondingCurve = new BondingCurve();
            let token_creation_hbar_fee = 50;
            let new_bonding_curve_hbar_value = Number( bondingCurve.b ) + Number( token_creation_hbar_fee  );

            const raw = {
                "name": name,
                "token_id": tokenData.tokenId.toString(),
                "ticker": symbol,
                "memo": memo,
                "description": description,
                "hashscan_url": tokenData.hashscanUrl,
                "bonding_curve_supply": bondingCurve.maxSaleSupply.toString(),
                "bonding_curve_hbar": new_bonding_curve_hbar_value.toString(),
                "wallet_address": this.accountId.toString()
            };

            // Save deployed token in DB
            return await this.saveTokenDetailsInDb( raw, 'POST' );

        } catch (error) {
            console.error("Error deploying token: ", error);
            throw error;
        }
    }


    /**
     * Send token data to the backend
     *
     * @param {Object} tokenData - The data to send to the backend
     *
     * @param method
     * @returns {Promise<Object>} - The backend response
     */
    async saveTokenDetailsInDb( tokenData: object, method: string): Promise<boolean|Object> {
        const requestOptions = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tokenData),
            redirect: "follow",
        };

        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/tokens`, requestOptions);
            const result = await response.json();

            if (result?.success) {

                return result.data;
            } else {

                return false;
            }
        } catch (error) {
            console.error("Error saving token data:", error);

            return false;
        }
    }


}

export default TokenService;


