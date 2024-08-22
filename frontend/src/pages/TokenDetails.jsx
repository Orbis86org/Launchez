import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Sale01 from '../components/sale/Sale01';

import img from '../assets/images/layout/contact.jpg'
import PageTitle from '../components/pagetitle';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import DiscussionForum from "../components/DiscussionForum";
import CandleStickChart from "../components/CandleStickChart";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {Button, ProgressBar, Spinner} from "react-bootstrap";
import {client, HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, sendTransaction} from "./Create";
import {AccountId, Hbar, PrivateKey, TransactionReceiptQuery, TransferTransaction} from "@hashgraph/sdk";
import BondingCurve from "../classes/BondingCurve";
import TradeExecutor from "../classes/TradeExecutor";
import {pairingData} from "../components/header";
import { SocialIcon } from 'react-social-icons'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


TokenDetails.propTypes = {

};

function TokenDetails(props) {

    const [tokenDetails, setTokenDetails] = useState( false );
    const [fetchingTokenDetails, setFetchingTokenDetails] = useState( false )
    useEffect(  () => {
        async function fetchData() {
            if( ! tokenDetails ){
                // Get token details from API.
                // Get token ID from URL
                const queryString = window.location.search;

                const urlParams = new URLSearchParams(queryString);

                let query_token_id = urlParams.get('token-id');

                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                };

                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tokens?token_id=${query_token_id}`, requestOptions)
                    .then((response) => response.text())
                    .then( function( result ){

                        result = JSON.parse( result );

                        setTokenDetails( result.data)
                    })
                    .catch((error) => console.error(error));

            }
        }

        fetchData();
    }, []);

    const bonding_curve = new BondingCurve(
        72000000000000000,
        70000000000000000,
        Number( tokenDetails?.bondingCurveSupply ),
        57500000000000000,
        Number( tokenDetails?.bondingCurveHBAR )
    );

    const [progressBarValue, setProgressBarValue ] = useState(0);
    useEffect(  () => {
        if( tokenDetails ){
            let progress_value = ( Number( tokenDetails?.bondingCurveSupply ) / bonding_curve?.maxSaleSupply  );

            setProgressBarValue( (1 - progress_value ) * 100 );
        }
    }, [ tokenDetails ]);


    /**
     * Execute a buy transaction, transferring token Y from buyer to treasury, and token X from treasury to buyer.
     * The fee is already accounted for by the BondingCurve class.
     * @param  buyerAccountId - The account ID of the buyer.
     * @param {number} amountY - The amount of token Y (Hbar) to spend.
     * @param tokenId
     * @returns {Object} - The result of the transaction including final price, amount of token X received, and slippage.
     * @throws {Error} - If the purchase would exceed allowed token limits.
     */
    async function executeBuy(buyerAccountId, amountY, tokenId) {
        try {
            // Simulate the buy to get the amount of token X and check for max supply limits
            let bonding_curve = new BondingCurve(
                72000000000000000,
                70000000000000000,
                Number( tokenDetails?.bondingCurveSupply ),
                57500000000000000,
                Number( tokenDetails?.bondingCurveHBAR )
            );
            const { finalPrice, amountX, slippage } = bonding_curve.simulateBuy(amountY);

            // Create a transaction to transfer Hbar (Y) from buyer to treasury
            const transferTx = new TransferTransaction()
                .addHbarTransfer(buyerAccountId, new Hbar(-amountY)) // Buyer pays amountY Hbar
                .addHbarTransfer( HEDERA_ACCOUNT_ID, new Hbar(amountY)) // Treasury receives amountY Hbar
                .addTokenTransfer(tokenId, HEDERA_ACCOUNT_ID, -amountX ) // Treasury sends amountX of token X
                .addTokenTransfer(tokenId, buyerAccountId, amountX); // Buyer receives amountX of token X;

            let sent = await sendTransaction(transferTx, pairingData?.accountIds[0] );
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

            if( ! full_transaction_id ){
                return false;
            }

            if (trans_receipt.status.toString() === "SUCCESS") {
                return { finalPrice, amountX, slippage };
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error executing buy transaction: ", error);
            return false;
        }
    }

    /**
     * Execute a sell transaction, transferring token X from seller to treasury, and token Y (Hbar) from treasury to seller.
     * The fee is already accounted for by the BondingCurve class.
     *
     * @param sellerAccountId
     * @param amountX
     * @param tokenId
     * @returns {Promise<boolean|{finalPrice: number, slippage: number, amountX}>}
     */
    async function executeSell(sellerAccountId, amountX, tokenId) {

        try {
            // Simulate the sell to get the amount of token Y (Hbar)

            // Account for decimals in token transfer
            amountX = amountX * Math.pow( 10, 8 );

            const { finalPrice, amountY, slippage } = bonding_curve.simulateSell(amountX);

            let tiny_bar_amount = Math.floor( amountY * Math.pow( 10, 8) );

            // Create a transaction to transfer token X from seller to treasury, and Hbar (Y) from treasury to seller
            const transferTx = new TransferTransaction()
                .addTokenTransfer(tokenId, sellerAccountId, -amountX) // Seller sends amountX of token X
                .addTokenTransfer(tokenId, HEDERA_ACCOUNT_ID, amountX) // Treasury receives amountX of token X
                .addHbarTransfer(HEDERA_ACCOUNT_ID, Hbar.fromTinybars( - tiny_bar_amount )) // Treasury sends amountY Hbar
                .addHbarTransfer(sellerAccountId, Hbar.fromTinybars( tiny_bar_amount ) ) // Seller receives amountY Hbar

            let sent = await sendTransaction(transferTx, pairingData?.accountIds[0] );
            let transaction_id = sent?.response?.transactionId;
            if( ! transaction_id ){
                return false;
            }

            let trans_receipt = await new TransactionReceiptQuery()
                .setTransactionId(transaction_id)
                .execute(client);

            let full_transaction_id = transaction_id.replace("@", "-").split('').reverse().join('')
                .replace('.', '-')
                .split('').reverse().join('');

            if( ! full_transaction_id ){
                return false;
            }


            if (trans_receipt.status.toString() === "SUCCESS") {
                return { finalPrice, amountY, slippage, tiny_bar_amount };
            } else {

                return false;
            }
        } catch (error) {
            console.error("Error executing sell transaction: ", error);
            return false;
        }
    }


    const [buyAmount, setBuyAmount] = useState(0);
    const[buySlippage, setBuySlippage] = useState(0);

    const [sellAmount, setSellAmount] = useState(0);
    const[sellSlippage, setSellSlippage] = useState(0);

    return (
        <>
            { tokenDetails ? <div>
                    <PageTitle heading='Token Details' title='Token Details' />

                    <section className="contact">
                        <div className="container">
                            <div className="row">
                                <div className="block-text center">
                                    <h3 className="heading">Token { tokenDetails?.name } - { tokenDetails?.tokenId }</h3>
                                    <hr/>
                                </div>

                                {/* Chart and Forum */}
                                <div className="col-8">
                                    <CandleStickChart />
                                    <DiscussionForum />
                                </div>

                                {/* Buy and Sell */}
                                <div className="col-4">
                                    <Tabs
                                        defaultActiveKey="buy"
                                        id="token-form"
                                        className="mb-3"
                                        fill
                                    >
                                        <Tab eventKey="buy" title="Buy">
                                            <form id='token-buy-form'>
                                                <InputGroup className="mb-3">
                                                    <InputGroup.Text id="basic-addon1">{`Buy ${ tokenDetails?.ticker } worth `}</InputGroup.Text>
                                                    <Form.Control
                                                        placeholder={ `HBAR Amount` }
                                                        aria-label={ `HBAR Amount` }
                                                        aria-describedby="basic-addon2"
                                                        name='buy_amount'
                                                        onChange={ function( e ){
                                                            setBuyAmount( e.target.value );
                                                        }}
                                                    />
                                                    <InputGroup.Text id="basic-addon2">HBAR</InputGroup.Text>
                                                </InputGroup>

                                                {/*<InputGroup className="mb-3">
                                            <Form.Control
                                                placeholder="Slippage"
                                                aria-label="Slippage"
                                                aria-describedby="basic-addon2"
                                                name='buy_slippage'
                                                onChange={ function( e ){
                                                    setBuySlippage( e.target.value );
                                                }}
                                            />
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup>*/}

                                                <Button
                                                    type="submit"
                                                    className="btn-action"
                                                    disabled={ !pairingData?.accountIds[0] }
                                                    onClick={ async function(e){
                                                        e.preventDefault();

                                                        let success = await executeBuy( pairingData?.accountIds[0], buyAmount, tokenDetails?.tokenId );
                                                        if( success && success?.amountX ){
                                                            // Update Db
                                                            let new_supply = Number( tokenDetails?.bondingCurveSupply ) - success?.amountX;
                                                            let new_hbar = Number( tokenDetails?.bondingCurveHbar ) + Number( buyAmount );


                                                            const myHeaders = new Headers();
                                                            myHeaders.append("Content-Type", "application/json");

                                                            const raw = JSON.stringify({
                                                                "token_id": tokenDetails?.tokenId,
                                                                "bonding_curve_supply": new_supply.toString(),
                                                                "bonding_curve_hbar": new_hbar.toString()
                                                            });

                                                            const requestOptions = {
                                                                method: "PUT",
                                                                headers: myHeaders,
                                                                body: raw,
                                                                redirect: "follow"
                                                            };

                                                            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tokens`, requestOptions)
                                                                .then((response) => response.text())
                                                                .then( function( result ){
                                                                    result = JSON.parse( result );

                                                                    setTokenDetails( result.data)
                                                                })
                                                                .catch((error) => console.error(error));

                                                            toast.success('Transaction Completed', {
                                                                position: "top-right",
                                                                autoClose: 5000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "light",
                                                            })
                                                        }else {
                                                            toast.error('Transaction Canceled', {
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
                                                    }}
                                                >
                                                    {pairingData?.accountIds[0] ? 'Place Trade' : 'Connect Wallet to Proceed'}
                                                </Button>

                                            </form>
                                        </Tab>


                                        <Tab eventKey="sell" title="Sell">
                                            <form id='token-sell-form'>
                                                <InputGroup className="mb-3">
                                                    <InputGroup.Text id="basic-addon1">Sell</InputGroup.Text>
                                                    <Form.Control
                                                        placeholder={ `Amount` }
                                                        aria-label={ `Amount` }
                                                        aria-describedby="basic-addon2"
                                                        name='sell_amount'
                                                        onChange={ function( e ){
                                                            setSellAmount( e.target.value );
                                                        }}
                                                    />
                                                    <InputGroup.Text id="basic-addon2">{ tokenDetails?.ticker }</InputGroup.Text>
                                                </InputGroup>

                                                {/*<InputGroup className="mb-3">
                                            <Form.Control
                                                placeholder="Slippage"
                                                aria-label="Slippage"
                                                aria-describedby="basic-addon2"
                                                name='sell_slippage'
                                                onChange={ function( e ){
                                                    setSellSlippage( e.target.value );
                                                }}
                                            />
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup> */}

                                                <Button
                                                    type="submit"
                                                    className="btn-action"
                                                    disabled={ !pairingData?.accountIds[0] }
                                                    onClick={ async function(e){
                                                        e.preventDefault();

                                                        let success = await executeSell( pairingData?.accountIds[0], sellAmount, tokenDetails?.tokenId );
                                                        if( success && success.tiny_bar_amount ){
                                                            // Update Db
                                                            let new_supply = Number( tokenDetails?.bondingCurveSupply ) + Number( sellAmount );
                                                            let new_hbar = Number( tokenDetails?.bondingCurveHbar ) - Number( success?.tiny_bar_amount / Math.pow(10, 8) );


                                                            const myHeaders = new Headers();
                                                            myHeaders.append("Content-Type", "application/json");

                                                            const raw = JSON.stringify({
                                                                "token_id": tokenDetails?.tokenId,
                                                                "bonding_curve_supply": new_supply.toString(),
                                                                "bonding_curve_hbar": new_hbar.toString()
                                                            });

                                                            const requestOptions = {
                                                                method: "PUT",
                                                                headers: myHeaders,
                                                                body: raw,
                                                                redirect: "follow"
                                                            };

                                                            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tokens`, requestOptions)
                                                                .then((response) => response.text())
                                                                .then( function( result ){
                                                                    result = JSON.parse( result );

                                                                    let progress_value = ( Number( result.data?.bondingCurveSupply ) / bonding_curve?.maxSaleSupply  );

                                                                    setProgressBarValue( (1 - progress_value ) * 100 );

                                                                    setTokenDetails( result.data)
                                                                })
                                                                .catch((error) => console.error(error));


                                                            toast.success('Transaction Completed', {
                                                                position: "top-right",
                                                                autoClose: 5000,
                                                                hideProgressBar: false,
                                                                closeOnClick: true,
                                                                pauseOnHover: true,
                                                                draggable: true,
                                                                progress: undefined,
                                                                theme: "light",
                                                            })
                                                        }else {
                                                            toast.error('Transaction Canceled', {
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
                                                    }}
                                                >
                                                    {pairingData?.accountIds[0] ? 'Place Trade' : 'Connect Wallet to Proceed'}
                                                </Button>

                                            </form>
                                        </Tab>
                                    </Tabs>

                                    {/* Bonding Curve Progress */}
                                    <div className="pt-4">
                                        <h6>Bonding Curve Progress</h6>
                                        <ProgressBar now={ (progressBarValue + 77).toLocaleString('en-US', { minimumFractionDigits: 2 } ) } animated labels={ `${ ( progressBarValue + 77 ).toLocaleString('en-US', { minimumFractionDigits: 2 } ) } %` }/>

                                        <div style={{ marginTop: '20px'}}>
                                            <strong>Bonding Curve Values: </strong>

                                            <div style={{ marginTop: '5px'}}>
                                                <strong>Bonding Curve Supply:</strong> { Number( tokenDetails?.bondingCurveSupply / Math.pow( 10, 8) ).toLocaleString('en-US', { minimumFractionDigits: 0 } )} (without 8 decimals)
                                                <br/>
                                                <strong>Bonding Curve HBAR:</strong> { Number( tokenDetails?.bondingCurveHbar ).toLocaleString('en-US', { minimumFractionDigits: 0 } )}
                                            </div>
                                        </div>



                                    </div>

                                    <div className={"pt-4"}>
                                        <h6>Follow Us</h6>
                                        <SocialIcon url="https://twitter.com" />
                                        <SocialIcon url="https://www.github.com" />
                                        <SocialIcon url="https://facebook.com" />
                                        <SocialIcon url="https://telegram.org" />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </section>

                </div> :
                <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
                    <Spinner animation="grow" />
                </div>
            }
        </>
    );
}

export default TokenDetails;