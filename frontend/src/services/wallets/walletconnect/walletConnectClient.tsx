import { WalletConnectContext } from "../../../contexts/WalletConnectContext";
import {memo, useCallback, useContext, useEffect} from 'react';
import { WalletInterface } from "../walletInterface";
import {
  AccountId,
  ContractExecuteTransaction,
  ContractId,
  LedgerId,
  TokenAssociateTransaction,
  TokenId,
  Transaction,
  TransactionId,
  TransferTransaction,
  Client,
  TokenCreateTransaction, TokenSupplyType, Hbar, PrivateKey
} from "@hashgraph/sdk";
import { ContractFunctionParameterBuilder } from "../contractFunctionParameterBuilder";
import { appConfig } from "../../../config";
import { SignClientTypes } from "@walletconnect/types";
import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId, SignAndExecuteTransactionParams, transactionToBase64String } from "@hashgraph/hedera-wallet-connect";
import EventEmitter from "events";

// Created refreshEvent because `dAppConnector.walletConnectClient.on(eventName, syncWithWalletConnectContext)` would not call syncWithWalletConnectContext
// Reference usage from walletconnect implementation https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/lib/dapp/index.ts#L120C1-L124C9
const refreshEvent = new EventEmitter();

// Create a new project in walletconnect cloud to generate a project id
const currentNetworkConfig = appConfig.networks.testnet;
const hederaNetwork = currentNetworkConfig.network;
const hederaClient = Client.forName(hederaNetwork);

// Adapted from walletconnect dapp example:
// https://github.com/hashgraph/hedera-wallet-connect/blob/main/src/examples/typescript/dapp/main.ts#L87C1-L101C4
// Create a new project in walletconnect cloud to generate a project id
const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;
const siteUrl = process.env.REACT_APP_FRONTEND_URL;
const siteName = process.env.REACT_APP_SITE_NAME;

const metadata: SignClientTypes.Metadata = {
  name: siteName,
  description: "",
  url: siteUrl,
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const dAppConnector = new DAppConnector(
    metadata,
    LedgerId.TESTNET,
    projectId,
    Object.values(HederaJsonRpcMethod),
    [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
    [HederaChainId.Mainnet],
)


// ensure walletconnect is initialized only once
let walletConnectInitPromise: Promise<void> | undefined = undefined;
const initializeWalletConnect = async () => {
  if (walletConnectInitPromise === undefined) {
    walletConnectInitPromise = dAppConnector.init({ logger: 'error' });
  }
  await walletConnectInitPromise;
};

export const openWalletConnectModal = async () => {
  await initializeWalletConnect();

  try {
    return new Promise<boolean>((resolve) => {
      // Subscribe to modal state changes
      const unsubscribe = dAppConnector.walletConnectModal.subscribeModal((newState) => {
        if (!newState.open) {
          // console.log('Modal was closed');
          unsubscribe(); // Clean up the listener
          resolve(false); // Resolve the promise with false
        }
      });

      // Open the modal and handle session flow
      dAppConnector.openModal().then(async (session) => {
        unsubscribe(); // Clean up the listener

        // Check if the session is acknowledged
        if (session.acknowledged) {
          refreshEvent.emit("sync");

          resolve(true); // Resolve with true for successful connection
        } else {
          refreshEvent.emit("sync");

          resolve(false); // Resolve with false if not fully connected
        }
      }).catch((error) => {
        refreshEvent.emit("sync");

        // console.error('Error during modal interaction:', error);
        unsubscribe(); // Clean up the listener
        resolve(false); // Resolve with false on error
      });
    });
  } catch (error) {
    // Handle modal closure or other errors

    return false;
  }

};

class WalletConnectWallet implements WalletInterface {
  private getSigner() {
    if (dAppConnector.signers.length === 0) {
      throw new Error('No signers found!');
    }
    return dAppConnector.signers[0];
  }

  private getAccountId() {
    // Need to convert from walletconnect's AccountId to hashgraph/sdk's AccountId because walletconnect's AccountId and hashgraph/sdk's AccountId are not the same!
    return AccountId.fromString(this.getSigner().getAccountId().toString());
  }

  async transferHBAR(toAddress: AccountId, amount: number) {
    const transferHBARTransaction = new TransferTransaction()
        .addHbarTransfer(this.getAccountId(), -amount)
        .addHbarTransfer(toAddress, amount);

    const signer = this.getSigner();
    await transferHBARTransaction.freezeWithSigner(signer);
    const txResult = await transferHBARTransaction.executeWithSigner(signer);

    return txResult ? txResult.transactionId : null;
  }

  async transferFungibleToken(toAddress: AccountId, tokenId: TokenId, amount: number) {
    const transferTokenTransaction = new TransferTransaction()
        .addTokenTransfer(tokenId, this.getAccountId(), -amount)
        .addTokenTransfer(tokenId, toAddress.toString(), amount);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async transferNonFungibleToken(toAddress: AccountId, tokenId: TokenId, serialNumber: number) {
    const transferTokenTransaction = new TransferTransaction()
        .addNftTransfer(tokenId, serialNumber, this.getAccountId(), toAddress);

    const signer = this.getSigner();
    await transferTokenTransaction.freezeWithSigner(signer);
    const txResult = await transferTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  async associateToken(tokenId: TokenId) {
    const associateTokenTransaction = new TokenAssociateTransaction()
        .setAccountId(this.getAccountId())
        .setTokenIds([tokenId]);

    const signer = this.getSigner();
    await associateTokenTransaction.freezeWithSigner(signer);
    const txResult = await associateTokenTransaction.executeWithSigner(signer);
    return txResult ? txResult.transactionId : null;
  }

  // Purpose: build contract execute transaction and send to wallet for signing and execution
  // Returns: Promise<TransactionId | null>
  async executeContractFunction(contractId: ContractId, functionName: string, functionParameters: ContractFunctionParameterBuilder, gasLimit: number) {
    const tx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gasLimit)
        .setFunction(functionName, functionParameters.buildHAPIParams());

    const signer = this.getSigner();
    await tx.freezeWithSigner(signer);
    const txResult = await tx.executeWithSigner(signer);

    // in order to read the contract call results, you will need to query the contract call's results form a mirror node using the transaction id
    // after getting the contract call results, use ethers and abi.decode to decode the call_result
    return txResult ? txResult.transactionId : null;
  }
  disconnect() {
    dAppConnector.disconnectAll().then(() => {
      refreshEvent.emit("sync");
      localStorage.removeItem('hederaAccountId')
    });
  }

  async executeTokenCreateTransaction(name: string, symbol: string, memo: string): Promise<TransactionId | string | null> {
    /*
     * The transaction also has to be signed by the treasury wallet since its funds/tokens are
     * being deducted. If not done, you get INVALID_SIGNATURE error
     *
     * https://stackoverflow.com/a/73535044
     */
    const tokenCreateTransaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTreasuryAccountId( process.env.REACT_APP_HEDERA_ACCOUNT_ID )
        .setMaxSupply( process.env.REACT_APP_HEDERA_TOKEN_MAX_SUPPLY)
        .setInitialSupply(process.env.REACT_APP_HEDERA_TOKEN_MAX_SUPPLY)
        .setSupplyType(TokenSupplyType.Finite)
        .setDecimals(8)
        .setTokenMemo(memo)
        .setMaxTransactionFee(new Hbar(30));


    // Step 1: Initialize the client with your private key
    const client = Client.forName(process.env.REACT_APP_HEDERA_NETWORK)
        .setOperator(process.env.REACT_APP_HEDERA_ACCOUNT_ID, process.env.REACT_APP_HEDERA_PRIVATE_KEY);

    // Step 2: Freeze the transaction to lock its details
    await tokenCreateTransaction.freezeWith(client);

    // Step 3: Sign the transaction with your private key
    const signedTransaction = await tokenCreateTransaction.signWithOperator(client);

    // Step 4: Sign with the other party's wallet (browser wallet)
    const signer = this.getSigner();
    const txResult = await signedTransaction.executeWithSigner(signer);


    return txResult ? txResult.transactionId : null;

  }

  async executeTokenAndHbarTransferTransaction(
      hbarAmount: number, // In HBAR units
      tokenId: TokenId,
      tokenAmount: number
  ): Promise<TransactionId | string | null> {

    // Convert the Hbar to Tinybar
    const tinybarAmount = Math.round(hbarAmount * 100000000); // Round to avoid fractional tinybars



    const transferTx = new TransferTransaction()
        .addHbarTransfer( this.getAccountId(), Hbar.fromTinybars( - tinybarAmount ))
        .addHbarTransfer( process.env.REACT_APP_HEDERA_ACCOUNT_ID, Hbar.fromTinybars( tinybarAmount ))
        .addTokenTransfer(tokenId, process.env.REACT_APP_HEDERA_ACCOUNT_ID, -tokenAmount )
        .addTokenTransfer(tokenId, this.getAccountId(), tokenAmount);


    // Step 1: Initialize the client with your private key
    const client = Client.forName(process.env.REACT_APP_HEDERA_NETWORK)
        .setOperator(process.env.REACT_APP_HEDERA_ACCOUNT_ID, process.env.REACT_APP_HEDERA_PRIVATE_KEY);

    // Step 2: Freeze the transaction to lock its details
    await transferTx.freezeWith(client);

    // Step 3: Sign the transaction with your private key
    const signedTransaction = await transferTx.signWithOperator(client);

    // Step 4: Sign with the other party's wallet (browser wallet)
    const signer = this.getSigner();
    const txResult = await signedTransaction.executeWithSigner(signer);


    return txResult ? txResult.transactionId : null;

  }

}
export const walletConnectWallet = new WalletConnectWallet();

// this component will sync the walletconnect state with the context
export const WalletConnectClient = () => {
  // use the HashpackContext to keep track of the hashpack account and connection
  const { setAccountId, setIsConnected } = useContext(WalletConnectContext);

  // sync the walletconnect state with the context
  const syncWithWalletConnectContext = useCallback(() => {
    const accountId = dAppConnector.signers[0]?.getAccountId()?.toString();
    if (accountId) {
      setAccountId(accountId);
      setIsConnected(true);
      localStorage.setItem('hederaAccountId', accountId)
    } else {
      setAccountId('');
      setIsConnected(false);
    }
  }, [setAccountId, setIsConnected]);

  useEffect(() => {
    // Sync after walletconnect finishes initializing
    refreshEvent.addListener("sync", syncWithWalletConnectContext);

    initializeWalletConnect().then(() => {
      syncWithWalletConnectContext();
    });

    return () => {
      refreshEvent.removeListener("sync", syncWithWalletConnectContext);
    }
  }, [syncWithWalletConnectContext]);


  return null;
};
