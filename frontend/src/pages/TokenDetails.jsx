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
import {AccountId, Hbar, PrivateKey, TransactionReceiptQuery, TransferTransaction} from "@hashgraph/sdk";
import BondingCurve from "../classes/BondingCurve";
import TradeExecutor from "../classes/TradeExecutor";
import { SocialIcon } from 'react-social-icons'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useWalletInterface} from "../services/wallets/useWalletInterface";
import {TransactionService} from "../services/transactions/transactionService";
import TokenService from "../services/tokens/tokenService";
import ToastsService from "../services/toasts/toastsService";


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
        process.env.REACT_APP_HEDERA_TOKEN_MAX_SUPPLY,
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
                process.env.REACT_APP_HEDERA_TOKEN_MAX_SUPPLY,
                Number( tokenDetails?.bondingCurveSupply ),
                57500000000000000,
                Number( tokenDetails?.bondingCurveHBAR )
            );
            const { finalPrice, amountX, slippage } = bonding_curve.simulateBuy(amountY);

            /*
             * Create a transaction to transfer Hbar (Y) from buyer to treasury, and transfer of token (X)
             * from treasury to buyer
             *
             * @type {TransactionId | string}
             */
            const transactionId = await walletInterface.executeTokenAndHbarTransferTransaction(
                amountY, // HBAR amount
                tokenId,// Token ID
                amountX, // Token Amount
            );

            if( ! transactionId ){
                return false;
            }

            const trans_receipt = await new TransactionService()
                .transactionQuery( transactionId );

            if ( trans_receipt ){
                return { finalPrice, amountX, slippage };
            }

            return false;
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

            const { finalPrice, amountY, slippage } = bonding_curve.simulateSell(amountX);


            // Create a transaction to transfer token X from seller to treasury, and Hbar (Y) from treasury to seller
            /*
              * Create a transaction to transfer token X from seller to treasury,
              * and Hbar (Y) from treasury to seller
              *
              * We add negatives in the amounts because we want the function to do the reverse
              * of what it is coded to do.
              *
              * @type {TransactionId | string}
              */
            const transactionId = await walletInterface.executeTokenAndHbarTransferTransaction(
                -amountY, // HBAR amount
                tokenId,// Token ID
                -amountX, // Token Amount
            );

            if( ! transactionId ){
                return false;
            }

            const transReceipt = await new TransactionService()
                .transactionQuery( transactionId );

            if ( transReceipt ){
                return { finalPrice, amountY, slippage };
            }

            return false;
        } catch (error) {
            console.error("Error executing sell transaction: ", error);
            return false;
        }
    }


    const [buyAmount, setBuyAmount] = useState(0);
    const[buySlippage, setBuySlippage] = useState(0);

    const [sellAmount, setSellAmount] = useState(0);
    const[sellSlippage, setSellSlippage] = useState(0);

    const { accountId, walletInterface } = useWalletInterface();

    return (
        <>
            { tokenDetails ? <div>
                    <PageTitle heading='Token Details' title='Token Details' />

                    <section className="contact">
                        <div className="container">
                            <div className="row">
                                <div className="block-text center">
                                    {tokenDetails.image && <img className="token_image_detail" src={`${process.env.REACT_APP_BACKEND_URL}/${tokenDetails.image.replace(/\\/g, '/')}`} alt={tokenDetails.name} />}
                                    <h3 className="heading">Token { tokenDetails?.name } - { tokenDetails?.tokenId }</h3>
                                    <hr/>
                                </div>

                                {/* Chart and Forum */}
                                <div className="col-md-8 col-xs-12">
                                    <CandleStickChart />
                                </div>

                                {/* Buy and Sell */}
                                <div className="col-md-4 col-xs-12">
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

                                                <Button
                                                    type="submit"
                                                    className="btn-action"
                                                    disabled={ ! accountId }
                                                    onClick={ async function(e){
                                                        e.preventDefault();

                                                        let success = await executeBuy( accountId, buyAmount, tokenDetails?.tokenId );
                                                        if( success && success?.amountX ){
                                                            // Update Db
                                                            let new_supply = Number( tokenDetails?.bondingCurveSupply ) - success?.amountX;
                                                            let new_hbar = Number( tokenDetails?.bondingCurveHbar ) + Number( buyAmount );

                                                            const tokenService = await  new TokenService(
                                                                AccountId.fromString( accountId ),
                                                                walletInterface
                                                            );

                                                            const raw = {
                                                                "token_id": tokenDetails?.tokenId,
                                                                "bonding_curve_supply": new_supply.toString(),
                                                                "bonding_curve_hbar": new_hbar.toString()
                                                            };

                                                            const tokenUpdated = await tokenService.saveTokenDetailsInDb( raw, 'PUT' );
                                                            if( ! tokenUpdated ) {
                                                                await new ToastsService().showErrorToast("An error has occurred. Please try again.");

                                                                return;
                                                            }

                                                            setTokenDetails( tokenUpdated );

                                                            await new ToastsService().showSuccessToast("Transaction Completed");

                                                        }else {
                                                            await new ToastsService().showErrorToast("Transaction Canceled");

                                                        }
                                                    }}
                                                >
                                                    { accountId ? 'Place Trade' : 'Connect Wallet to Proceed'}
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

                                                <Button
                                                    type="submit"
                                                    className="btn-action"
                                                    disabled={ ! accountId }
                                                    onClick={ async function(e){
                                                        e.preventDefault();

                                                        // Account for decimals in token transfer
                                                        const tokenSellAmount = sellAmount * Math.pow( 10, 8 );

                                                        let success = await executeSell( accountId, tokenSellAmount, tokenDetails?.tokenId );
                                                        if( success && success?.amountY ){
                                                           // Update Db
                                                           let new_supply = Number( tokenDetails?.bondingCurveSupply ) + Number( tokenSellAmount );
                                                           let new_hbar = Number( tokenDetails?.bondingCurveHbar ) - Number( success?.amountY );

                                                           const tokenService = await new TokenService(
                                                               AccountId.fromString( accountId ),
                                                               walletInterface
                                                           );

                                                           const raw = {
                                                               "token_id": tokenDetails?.tokenId,
                                                               "bonding_curve_supply": new_supply.toString(),
                                                               "bonding_curve_hbar": new_hbar.toString()
                                                           };

                                                           const tokenUpdated = await tokenService.saveTokenDetailsInDb( raw, 'PUT' );
                                                           if( ! tokenUpdated ) {
                                                               await new ToastsService().showErrorToast("An error has occurred. Please try again.");

                                                               return;
                                                           }

                                                           let progress_value = ( Number( tokenUpdated?.bondingCurveSupply ) / bonding_curve?.maxSaleSupply  );

                                                           setProgressBarValue( (1 - progress_value ) * 100 );
                                                           setTokenDetails( tokenUpdated );

                                                           await new ToastsService().showSuccessToast("Transaction Completed");

                                                           /*=========================*/

                                                        } else {
                                                            await new ToastsService().showErrorToast('Transaction Canceled');
                                                        }
                                                    }}
                                                >
                                                    { accountId ? 'Place Trade' : 'Connect Wallet to Proceed'}
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
                                                <strong>Bonding Curve Supply:</strong> { Number( tokenDetails?.bondingCurveSupply / Math.pow( 10, 8) ).toLocaleString('en-US', { minimumFractionDigits: 0 } )}
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

                            <div className='row'>
                                {/* Chart and Forum */}
                                <div className="col-md-8 col-xs-12">
                                    <DiscussionForum tokenId={tokenDetails?.tokenId}/>
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