import React, {useState} from 'react';
import PageTitle from '../components/pagetitle';
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
import TokenService from "../services/tokens/tokenService";
import {useWalletInterface} from "../services/wallets/useWalletInterface";
import ToastsService from "../services/toasts/toastsService";
import TokenDetails from "./TokenDetails";

Create.propTypes = {

};

function Create(props) {

    const [form, setForm] = useState( null );
    const [name, setName ] = useState('');
    const [ticker, setTicker ] = useState('');
    const [description, setDescription] = useState('');

    const { accountId, walletInterface } = useWalletInterface();


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
                                            const tokenCreated = await new TokenService(
                                                AccountId.fromString( accountId ),
                                                walletInterface
                                            ).deployToken(
                                                name,
                                                ticker,
                                                name + " Token Launch",
                                                description
                                            )

                                            if( ! tokenCreated ) {
                                                await new ToastsService().showErrorToast("An error has occurred. Please try again.");

                                                return;
                                            }

                                            // Token Created Successfully
                                            await new ToastsService().showSuccessToast("Token Created Successfully");

                                            window.location.replace(`/token?token-id=${ tokenCreated?.tokenId }`);


                                        }}
                                        disabled={ ! accountId }
                                    >
                                        { accountId ? 'Create Token' : 'Connect Wallet to Proceed'}
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