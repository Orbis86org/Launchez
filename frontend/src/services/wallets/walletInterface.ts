import {AccountId, ContractId, TokenCreateTransaction, TokenId, TransactionId} from "@hashgraph/sdk";
import { ContractFunctionParameterBuilder } from "./contractFunctionParameterBuilder";

export interface WalletInterface {
  executeContractFunction: (contractId: ContractId, functionName: string, functionParameters: ContractFunctionParameterBuilder, gasLimit: number) => Promise<TransactionId | string | null>;
  disconnect: () => void;
  transferHBAR: (toAddress: AccountId, amount: number, memo: string) => Promise<TransactionId | string | null>;
  transferFungibleToken: (toAddress: AccountId, tokenId: TokenId, amount: number) => Promise<TransactionId | string | null>;
  transferNonFungibleToken: (toAddress: AccountId, tokenId: TokenId, serialNumber: number) => Promise<TransactionId | string | null>;
  associateToken: (tokenId: TokenId) => Promise<TransactionId | string | null>;
  executeTokenCreateTransactionWithFees: ( name: string, symbol: string, memo: string, accountId: AccountId ) => Promise<TransactionId | string | null>;
  executeTokenAndHbarTransferTransaction: ( hbarAmount: number, tokenId: TokenId, tokenAmount: number ) => Promise<TransactionId | string | null>;
}