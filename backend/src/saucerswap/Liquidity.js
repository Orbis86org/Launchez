/**
 * Liquidity Class
 */
const {
    ContractFunctionParameters,
    ContractExecuteTransaction,
    AccountAllowanceApproveTransaction,
    AccountUpdateTransaction,
    HbarUnit,
    EntityIdHelper,
    Client,
    AccountId,
    PrivateKey,
    TransactionId,
    TransactionReceiptQuery,
    TokenId,
    ContractId, AccountInfoQuery, // for token auto-association
} = require('@hashgraph/sdk');

const ethers = require('ethers');
const BigNumber = require('bignumber.js');
const axios = require('axios');

class Liquidity {

    /**
     * Client Config
     *
     * @param clientConfig
     * @param saucerSwapV1RouterV3ContractAddress
     * @param mirrorNodeBaseUrl
     */
    constructor( clientConfig, saucerSwapV1RouterV3ContractAddress, mirrorNodeBaseUrl ) {
        this.client = this.setupClient(clientConfig);
        this.clientConfig = clientConfig;

        this.saucerSwapV1RouterV3ContractAddress = saucerSwapV1RouterV3ContractAddress;

        this.mirrorNodeBaseUrl = mirrorNodeBaseUrl;
    }

    /**
     * Setup network
     */
    setupClient( clientConfig ) {
        let client;

        switch ( clientConfig.network ) {
            case 'mainnet':
                client = Client.forMainnet();
                break;
            case 'testnet':
                client = Client.forTestnet();
                break;
            case 'previewnet':
                client = Client.forPreviewnet();
                break;
            default:
                throw new Error("Please specify the correct Hedera network.");
        }

        client.setOperator(
            AccountId.fromString( clientConfig?.accountId ),
            PrivateKey.fromString( clientConfig?.privateKey )
        );

        return client;
    }

    /**
     * Enable Automatic Token Association For Account.
     *
     * Without it, we will get a token not associated error. This occurs since the create liquidity
     * pool method creates new tokens that are not yet associated with the account.
     *
     * @returns {Promise<boolean>}
     */
    async enableAutomaticTokenAssociationForAccount() {
        try{
            let associateTx = await new AccountUpdateTransaction()
                .setAccountId( this.clientConfig.accountId )
                .setMaxAutomaticTokenAssociations( 100 ) // Max 1,000
                .freezeWith( this.client )
                .sign( PrivateKey.fromString( this.clientConfig?.privateKey ) );

            let associateTxSubmit = await associateTx.execute( this.client );
            let associateRx = await associateTxSubmit.getReceipt( this.client );

            return associateRx.status === 'SUCCESS';

        } catch (e) {
            console.log('Error: ', e )
            return false;
        }
    }

    /**
     * Grant contract allowance
     *
     * @param tokenId // Token ID
     * @param spender_address // Address of the one two use/spend the token e.g. Contract ID
     * @param amount // Token Amount
     */
    async grantContractAllowance( tokenId, spender_address, amount  ){

        try{

            //Create the transaction
            const transaction = new AccountAllowanceApproveTransaction()
                .approveTokenAllowance( tokenId, this.clientConfig.accountId, spender_address, amount );

            transaction.freezeWith( this.client );

            //Sign the transaction with the owner account key
            const signTx = await transaction.sign( PrivateKey.fromString( this.clientConfig.privateKey ) );

            //Sign the transaction with the client operator private key and submit to a Hedera network
            const txResponse = await signTx.execute( this.client );

            //Request the receipt of the transaction
            const receipt = await txResponse.getReceipt( this.client );

            //Get the transaction consensus status
            const transactionStatus = receipt.status;

            return transactionStatus.toString() === 'SUCCESS'


        }catch(e){
            return false;
        }

    }


    /**
     * Increase Max Token Associations
     *
     * @param additionalAssociations
     * @returns {Promise<void>}
     */
    async increaseMaxTokenAssociationsIfNeeded(additionalAssociations) {
        // Fetch account info
        const accountInfo = await new AccountInfoQuery()
            .setAccountId(this.clientConfig.accountId)
            .execute(this.client);

        const currentMaxAssociations = accountInfo.maxAutomaticTokenAssociations;
        const currentAssociations = accountInfo.tokenRelationships.length;

        // Calculate required max associations
        const requiredMaxAssociations = currentAssociations + additionalAssociations;

        if (requiredMaxAssociations > currentMaxAssociations) {
            // Increase maxAutomaticTokenAssociations
            const updateTransaction = new AccountUpdateTransaction()
                .setAccountId(this.clientConfig.accountId)
                .setMaxAutomaticTokenAssociations(requiredMaxAssociations)
                .freezeWith(this.client);

            // Sign the transaction
            const signTx = await updateTransaction.sign(PrivateKey.fromString(this.clientConfig.privateKey));

            // Execute the transaction
            const txResponse = await signTx.execute(this.client);

            // Get the receipt to ensure it was successful
            const receipt = await txResponse.getReceipt(this.client);

            // console.log(`Updated max token associations to ${requiredMaxAssociations}. Status: ${receipt.status}`);

            if (receipt.status.toString() !== 'SUCCESS') {
                throw new Error('Failed to update max token associations');
            }
        } else {
            // console.log('No need to increase max token associations.');
        }
    }



    /**
     * Pool Creation Fee
     *
     * The current fee for creating V1 liquidity pools is $50 USD, paid in HBAR.
     * The exchange rate information is used to accurately determine the equivalent value in HBAR.
     *
     * The pairCreateFee() function will return the current fee expressed in Tinycent (US).
     *
     * The current fee for creating V1 liquidity pools is $50 USD, paid in HBAR.
     * The exchange rate information is used to accurately determine the equivalent value in HBAR.
     *
     * @link https://docs.saucerswap.finance/v/developer/saucerswap-v1/liquidity-operations/pool-creation-fee
     */
    async getPoolCreationFee()  {
        /**
         * We comment out this part since I can't find the contract's ABI at this time
         * Since we know the fee is constant right now (USD 50), we convert it directly
         * to HBAR
         *
         //Set one of Hedera's JSON RPC Relay as the provider
         const provider = new ethers.JsonRpcProvider(hederaJsonRelayUrl, '', {
            batchMaxCount: 1, //workaround for V6
        });

         //load ABI data containing Factory's pairCreateFee function
         const interfaces = new ethers.Interface(abi);

         //get pool creation fee in tinycent
         const factoryContract = new ethers.Contract(factoryEvmAddress, interfaces.fragments, provider);
         const result = await factoryContract.pairCreateFee();
         const tinycent = Number(result); //amount in tinycent (US)*/

        const tinycent = Number( '5000' );

        //get the current exchange rate via REST API
        const url = `${this.mirrorNodeBaseUrl}/api/v1/network/exchangerate`;
        const response = await axios.get(url);
        const currentRate = response.data.current_rate;
        const centEquivalent = Number(currentRate.cent_equivalent);
        const hbarEquivalent = Number(currentRate.hbar_equivalent);
        const centToHbarRatio = centEquivalent/hbarEquivalent;

        //calculate the fee in terms of HBAR
        const poolCreateFeeInHbar = BigNumber(tinycent / centToHbarRatio).decimalPlaces(0);
        // console.log(`Pool creation fee: ${poolCreateFeeInHbar.toString()}`);

        return poolCreateFeeInHbar;
    }


    /**
     * Get Liquidity Pool SaucerSwap link
     *
     * @param tokenId
     * @returns {Promise<string|boolean>}
     */
    async getLiquidityPoolLink( tokenId ){
        const myHeaders = new Headers();

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const endpoint = process.env.SAUCER_SWAP_API_URL + '/pools';

        const response = await fetch(endpoint, requestOptions);
        if( ! response ){
            return false;
        }

        const pools = await response.json();
        if( ! pools ){
            return false;
        }


        let contractId = null;
        pools?.forEach( function( item, index, array ){
            if( item?.tokenA?.id === tokenId && item?.tokenB?.id === process.env.SAUCER_SWAP_WHBAR_TOKEN_ID ){
                contractId = item.contractId;

                return;
            }

            if( item?.tokenB?.id === tokenId && item?.tokenA?.id === process.env.SAUCER_SWAP_WHBAR_TOKEN_ID ){
                contractId = item.contractId;
            }

        } );

        if( ! contractId ){
            return false;
        }

        return process.env.HEDERA_OPERATOR_NETWORK === 'testnet' ? 'https://testnet.saucerswap.finance/liquidity/' + contractId : 'https://saucerswap.finance/liquidity/' + contractId

    }

    /**
     * Creating a New Token/Token Liquidity Pool
     *
     * @link https://docs.saucerswap.finance/v/developer/saucerswap-v1/liquidity-operations/create-a-new-pool#creating-a-new-token-token-liquidity-pool
     *
     * @param tokenAEvmAddress
     * @param tokenBEvmAddress
     * @param amountADesired
     * @param amountBDesired
     * @param amountAMin
     * @param amountBMin
     * @param toEvmAddress
     * @param gasLimit
     */
    async createNewTokenTokenLiquidityPool (
        tokenAEvmAddress,
        tokenBEvmAddress,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        toEvmAddress,
        gasLimit
    ) {
        try {
            //Client pre-checks:
            // - Max auto-association increased by one
            // - Router contract has spender allowance for the input tokens

            const params = new ContractFunctionParameters();
            params.addAddress( tokenAEvmAddress ); //address tokenA
            params.addAddress( tokenBEvmAddress ); //address tokenB
            params.addUint256( amountADesired ); //uint amountADesired - in smallest unit
            params.addUint256(amountBDesired); //uint amountBDesired - in smallest unit
            params.addUint256(amountAMin); //uint amountAMin - in smallest unit
            params.addUint256(amountBMin); //uint amountBMin - in smallest unit
            params.addAddress(toEvmAddress); //address to
            params.addUint256( Math.floor(Date.now() / 1000) + 1000 ); //uint deadline - Unix seconds - from 1970

            const poolCreationFeeHbar = await this.getPoolCreationFee();

            const response = await new ContractExecuteTransaction()
                .setPayableAmount(poolCreationFeeHbar)
                .setContractId( this.saucerSwapV1RouterV3ContractAddress )
                /**
                 * If you get INSUFFICIENT_GAS error, it means that your gas limit for the transaction is
                 * too low so the transaction run out of gas before it's done with the execution.
                 *
                 * @link https://stackoverflow.com/questions/75767756/why-i-get-insufficient-gas-when-i-try-to-deploy-a-smart-contract-on-hedera
                 */
                .setGas( gasLimit )
                .setFunction('addLiquidityNewPool', params)
                .execute(this.client);

            const record = await response.getRecord(this.client);
            const result = record.contractFunctionResult;
            const values = result.getResult(['uint', 'uint', 'uint']);
            const amountA = values[0]; //uint amountA - in its smallest unit
            const amountB = values[1]; //uint amountB - in its smallest unit
            const liquidity = values[2]; //uint liquidity

            return {amountA, amountB, liquidity};
        } catch (e) {
            return false;
        }
    }



    /**
     * Creating a New HBAR/Token Liquidity Pool
     *
     * @link https://docs.saucerswap.finance/v/developer/saucerswap-v1/liquidity-operations/create-a-new-pool#creating-a-new-hbar-token-liquidity-pool
     *
     * @param tokenId
     * @param amountTokenDesired // The maximum token amount in its smallest unit
     * @param amountTokenMin // The minimum token amount in its smallest unit
     * @param amountHBARMin // The minimum HBAR amount in its smallest unit (tinybar)
     * @param toAddress // EVM address to receive the new liquidity tokens
     * @param gasLimit // Gas Limit
     */
    async createNewHBARTokenLiquidityPool(
        tokenId,
        amountTokenDesired,
        amountTokenMin,
        amountHBARMin,
        toAddress,
        gasLimit
    ) {

        try{
            //Client pre-checks:
            // - Max auto-association increased by one
            // - Router contract has spender allowance for the input token

            // Enable automatic account associations
            await this.enableAutomaticTokenAssociationForAccount();

            // Ensure max token auto-association is sufficient
            await this.increaseMaxTokenAssociationsIfNeeded(1);

            // Grant allowance
            const granted = await this.grantContractAllowance(
                TokenId.fromString( tokenId ),
                this.saucerSwapV1RouterV3ContractAddress,
                amountTokenDesired
            )

            if( ! granted ){
                return false;
            }

            let tokenEVMAddress = TokenId.fromString( tokenId ).toSolidityAddress();

            const params = new ContractFunctionParameters();
            params.addAddress( tokenEVMAddress ); //address token
            params.addUint256(amountTokenDesired); //uint amountTokenDesired  - in smallest unit
            params.addUint256(amountTokenMin); //uint amountTokenMin  - in smallest unit
            params.addUint256(amountHBARMin); //uint amountETHMin  - in smallest unit
            params.addAddress(toAddress); //address to
            params.addUint256( Math.floor(Date.now() / 1000) + 1000 ); //uint deadline - Unix seconds - from 1970

            const poolCreationFeeHbar = await this.getPoolCreationFee();
            const inputHbarAndPoolCreationFeeHbar = poolCreationFeeHbar + amountHBARMin > 0 ? ethers.formatUnits( amountHBARMin, 6 ) : amountHBARMin

            const nodeAccountIds = [
                new AccountId(3),
            ];

            const response = await new ContractExecuteTransaction()
                .setNodeAccountIds( nodeAccountIds )
                .setPayableAmount(inputHbarAndPoolCreationFeeHbar) //input hbar + pool creation fee
                .setContractId( this.saucerSwapV1RouterV3ContractAddress )
                /**
                 * If you get INSUFFICIENT_GAS error, it means that your gas limit for the transaction is
                 * too low so the transaction run out of gas before it's done with the execution.
                 *
                 * @link https://stackoverflow.com/questions/75767756/why-i-get-insufficient-gas-when-i-try-to-deploy-a-smart-contract-on-hedera
                 */
                .setGas( gasLimit )
                .setFunction('addLiquidityETHNewPool', params)
                .execute(this.client);

            const record = await response.getRecord(this.client);
            const result = record.contractFunctionResult;
            const values = result.getResult(['uint','uint','uint']);
            const amountToken = values[0]; //uint amountToken
            const amountHBAR = values[1]; //uint amountETH
            const liquidity = values[2]; //uint liquidity

            // return {amountToken, amountHBAR, liquidity};

            if( values ){
                return true;
            }


        } catch (e) {
            console.log('Error Occurred: ', e )
        }

        return false;
    }
}

module.exports = Liquidity;