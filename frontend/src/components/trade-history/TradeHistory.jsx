import PropTypes from "prop-types";
import {TabPanel, Tabs} from "react-tabs";
import {Link} from "react-router-dom";
import img from "../../assets/images/layout/contact.jpg";
import React from "react";

TradeHistory.propTypes = {
    trades: PropTypes.array,
}

function TradeHistory({trades}) {


    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="">
                            <Tabs>
                                {
                                    trades.map(data => (
                                        <TabPanel key={data.id}>
                                            <div className="content-inner">
                                                <table className="table">
                                                    <thead>
                                                    <tr>
                                                        <th scope="col" style={{color: 'var(--onsurface)'}}>Account</th>
                                                        <th scope="col" style={{color: 'var(--onsurface)'}}>Type</th>
                                                        <th scope="col" style={{color: 'var(--onsurface)'}}>Amount</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>

                                                    {
                                                        trades?.map(idx => (

                                                            <tr key={idx.walletAddress}>
                                                                <td style={{color: 'var(--text)'}}>
                                                                    <Link to={`/profile/${idx.walletAddress}`}>
                                                                        {idx.walletAddress}
                                                                    </Link>
                                                                </td>
                                                                <td style={{color: 'var(--text)'}}>
                                                                    {idx.type.charAt(0).toUpperCase() + idx.type.slice(1)}
                                                                </td>
                                                                <td style={{color: 'var(--text)'}}>
                                                                    {/* The Tokens Have 8 Decimals  ( y value below ) */}
                                                                    {Number(idx.amount / Math.pow(10, 8)).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }

                                                    </tbody>
                                                </table>
                                            </div>
                                        </TabPanel>
                                    ))
                                }


                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TradeHistory;