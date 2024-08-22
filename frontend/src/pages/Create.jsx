import React, {useState} from 'react';
import PageTitle from '../components/pagetitle';
import {hashconnect, initData, pairingData} from '../components/header'
import {
    AccountId,
    Client, CustomFee,
    Hbar,
    PrivateKey,
    TokenCreateTransaction,
    TokenSupplyType,
    Transaction,
    TransactionId,
    TransactionReceiptQuery, TransferTransaction
} from "@hashgraph/sdk";

import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BondingCurve from "../classes/BondingCurve";

Create.propTypes = {

};

let client = null;
if( process.env.REACT_APP_HEDERA_NETWORK === 'mainnet' ){
    client = Client.forMainnet();
} else {
    client = Client.forTestnet();
}

let HEDERA_ACCOUNT_ID = AccountId.fromString( process.env.REACT_APP_HEDERA_ACCOUNT_ID );
let HEDERA_PRIVATE_KEY = PrivateKey.fromString( process.env.REACT_APP_HEDERA_PRIVATE_KEY );

async function signAndMakeBytes(trans, signingAcctId) {

    const privKey = HEDERA_PRIVATE_KEY;
    const pubKey = privKey.publicKey;

    let nodeId = [new AccountId(3)];
    let transId = TransactionId.generate(signingAcctId)

    trans.setNodeAccountIds(nodeId);
    trans.setTransactionId(transId);

    trans = await trans.freeze();

    let transBytes = trans.toBytes();

    const sig = await privKey.signTransaction(Transaction.fromBytes(transBytes));

    const out = trans.addSignature(pubKey, sig);

    return out.toBytes();
}

async function makeBytes(trans, signingAcctId) {
    let transId = TransactionId.generate(signingAcctId)
    trans.setTransactionId(transId);
    trans.setNodeAccountIds([new AccountId(3)]);

    await trans.freeze();

    return trans.toBytes();
}

async function sendTransaction(trans, acctToSign) {
    try{
        let transactionBytes = await signAndMakeBytes(trans, acctToSign);

        const transaction = {
            topic: initData.topic,
            byteArray: transactionBytes,
            metadata: {
                accountToSign: acctToSign,
                returnTransaction: false,
                hideNft: false
            }
        }

        return await hashconnect.sendTransaction(initData.topic, transaction);
    } catch (e) {
        return false;
    }
}

async function initializeToken( name, symbol, memo ) {
    try {
        // Create a new TokenCreateTransaction with the provided config parameters
        const tx = new TokenCreateTransaction()
            .setTokenName(name) // Set the token name
            .setTokenSymbol(symbol) // Set the token symbol
            .setTreasuryAccountId( HEDERA_ACCOUNT_ID ) // Set the treasury account ID
            // 70000000000000000
            .setMaxSupply(70000000000000000) // Set the maximum supply of the token
            .setInitialSupply(70000000000000000) // Set the initial supply of the token
            .setSupplyType( TokenSupplyType.Finite )
            .setDecimals(8) // Set the number of decimals for the token
            .setTokenMemo(memo) // Set an optional memo for the token
            .setMaxTransactionFee(new Hbar(30));

        // Add 50 HBAR Fee
        const hbarFee = new TransferTransaction()
            .addHbarTransfer( pairingData?.accountIds[0], new Hbar(-token_creation_hbar_fee )) // Buyer pays 50 Hbar
            .addHbarTransfer( HEDERA_ACCOUNT_ID, new Hbar( token_creation_hbar_fee )) // Treasury receives 50 Hbar

        return tx;

    } catch (error) {
        console.error("Error initializing token: ", error); // Log any errors that occur during initialization
        // throw error; // Re-throw the error to ensure it's handled by the caller

        return false;
    }
}

async function deployToken( transaction ) {
    try {
        let sent = await sendTransaction(transaction, pairingData?.accountIds[0] );
        let transaction_id = sent?.response?.transactionId;
        if( ! transaction_id ){
            return false;
        }

        let trans_receipt = await new TransactionReceiptQuery()
            .setTransactionId(transaction_id)
            .execute(client)

        let full_transaction_id = transaction_id.replace("@", "-").split('').reverse().join('')
            .replace('.', '-')
            .split('').reverse().join('');

        let hashscan_url = 'https://hashscan.io/testnet/transaction/' + full_transaction_id;

        return {
            token_id: trans_receipt.tokenId,
            hashscan_url: hashscan_url
        }
    } catch (error) {
        console.error("Error deploying token: ", error); // Log any errors that occur during deployment
        throw error; // Re-throw the error to ensure it's handled by the caller
    }
}

const token_creation_hbar_fee = 50;
function Create(props) {

    const [form, setForm] = useState( null );
    const [name, setName ] = useState('');
    const [ticker, setTicker ] = useState('');
    const [description, setDescription] = useState('');




    return (
        <div>
            <PageTitle heading='Create Token' title='Create Token' />

            <section className="contact">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="contact-main">
                                <div className="block-text center">
                                    <h3 className="heading">Create a Token Below</h3>
                                    <p className="desc fs-20">Fill the Form Below to Create a Token</p>
                                </div>

                                <form
                                    id='token-creation'
                                    ref={ form => setForm( form )}
                                >
                                    <div className="form-group">
                                        <label>Token Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Token Name"
                                            onChange={ function( e ){
                                                setName( e.target.value );
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Token Ticker</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Token Ticker"
                                            onChange={ function( e ){
                                                setTicker( e.target.value );
                                            }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            cols="30"
                                            rows="10"
                                            className="form-control"
                                            placeholder="Token Description"
                                            onChange={ function( e ){
                                                setDescription( e.target.value );
                                            }}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-action"
                                        onClick={ async function( e ){
                                            e.preventDefault();

                                            // Step 1: Launch the Token
                                            let transaction = await initializeToken( name, ticker, name + " Token Launch" );
                                            if( transaction ){
                                                const tokenId = await deployToken( transaction );
                                                const bondingCurve = new BondingCurve();

                                                if( tokenId ){

                                                    /**
                                                     * Send data to backend
                                                     */
                                                    const myHeaders = new Headers();
                                                    myHeaders.append("Content-Type", "application/json");

                                                    const raw = JSON.stringify({
                                                        "name": name,
                                                        "token_id": tokenId?.token_id.toString(),
                                                        "ticker": ticker,
                                                        "description": description,
                                                        "hashscan_url": tokenId?.hashscan_url,
                                                        "bonding_curve_supply": bondingCurve.maxSaleSupply.toString(),
                                                        "bonding_curve_hbar": (bondingCurve.b + token_creation_hbar_fee).toString(),
                                                        "wallet_address": pairingData?.accountIds[0]
                                                    });

                                                    const requestOptions = {
                                                        method: "POST",
                                                        headers: myHeaders,
                                                        body: raw,
                                                        redirect: "follow"
                                                    };

                                                    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tokens`, requestOptions)
                                                        .then((response) => response.text())
                                                        .then( function ( result ) {
                                                            result = JSON.parse( result );

                                                            if( result?.success ){
                                                                toast.success('Token Created Successfully', {
                                                                    position: "top-right",
                                                                    autoClose: 5000,
                                                                    hideProgressBar: false,
                                                                    closeOnClick: true,
                                                                    pauseOnHover: true,
                                                                    draggable: true,
                                                                    progress: undefined,
                                                                    theme: "light",
                                                                });

                                                                // Redirect to token page
                                                                window.location.replace('/token?token-id=' + result?.data?.tokenId)
                                                            } else {
                                                                toast.error('An error has occurred. Please try again.', {
                                                                    position: "top-right",
                                                                    autoClose: 5000,
                                                                    hideProgressBar: false,
                                                                    closeOnClick: true,
                                                                    pauseOnHover: true,
                                                                    draggable: true,
                                                                    progress: undefined,
                                                                    theme: "light",
                                                                });

                                                            }

                                                        })
                                                        .catch( function ( error ) {
                                                            console.log( error );
                                                            toast.error('An error has occurred. Please try again.', {
                                                                position: "top-right",
                                                                autoClose: 5000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "light",
                                                            });

                                                        });



                                                }

                                            }


                                        }}
                                        disabled={ !pairingData?.accountIds[0] }
                                    >
                                        {pairingData?.accountIds[0] ? 'Create Token' : 'Connect Wallet to Proceed'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Create;
export { client, HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, signAndMakeBytes, makeBytes, sendTransaction}