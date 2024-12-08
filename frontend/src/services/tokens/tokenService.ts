
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
     *
     * @param name
     * @param symbol
     * @param memo
     * @param description
     * @param image
     */
    async deployToken( name: string, symbol: string, memo: string, description: string, image: File) {
        try {
            const transactionId = await this
                .walletInterface
                .executeTokenCreateTransactionWithFees( name, symbol, memo, this.accountId );

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
            let token_creation_hbar_fee = parseInt( process.env.REACT_APP_HEDERA_TOKEN_CREATION_FEE );
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
            return await this.saveTokenDetailsInDb( raw, image, 'POST' );

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
     * @param image
     * @param method
     * @returns {Promise<Object>} - The backend response
     */
    async saveTokenDetailsInDb( tokenData: object, image: File, method: string): Promise<boolean|Object> {

        try {
            const formData = new FormData();

            for (const key in tokenData) {
                formData.append(key, tokenData[key as keyof typeof tokenData]);
            }
            if (image) {
                formData.append("image", image); // Append the image
            }

            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/tokens`, {
                method: method,
                body: formData,
                redirect: "follow",
            });
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

    /**
     * Create Liquidity Pool in Saucer Swap
     *
     * @param tokenData
     */
    async createLiquidityPool( tokenData: object ): Promise<boolean|Object> {
        const requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tokenData),
            redirect: "follow",
        };

        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/liquidity/create`, requestOptions);
            const result = await response.json();

            if (result?.success) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error saving token data:", error);

            return false;
        }
    }

    /**
     * Create Liquidity Pool in Saucer Swap
     *
     * @param tokenId
     */
    async getTokenDetails( tokenId: string ): Promise<boolean|Object> {
        const requestOptions = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
        };

        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/tokens?token_id=${tokenId}`, requestOptions);
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

    /**
     * Create Liquidity Pool Link in Saucer Swap
     *
     * @param tokenId
     */
    async getLiquidityPoolLink( tokenId: string ): Promise<boolean|Object> {
        const requestOptions = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
        };

        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/liquidity/tokens?token_id=${tokenId}`, requestOptions);
            const result = await response.json();

            if (result?.success) {
                return result.link;
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


