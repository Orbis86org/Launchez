import React , {useState} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import img from "../../assets/images/layout/contact.jpg";




Coinlist01.propTypes = {
    dataCoin: PropTypes.array,
};

function Coinlist01(props) {

    const {dataCoin} = props;


    return (
        <section className="coin-list">
            <div className="container">
                <div className="row">
                <div className="col-md-12">
                    <div className="block-text">
                    <h3 className="heading">Market Update</h3>
                    <Link to="#" className="btn-action-2" >See All Coins</Link>
                    </div>

                    <div className="coin-list__main">
                    <Tabs>
                            {
                                dataCoin.map(data => (
                                    <TabPanel key={data.id}>
                                        <div className="content-inner">
                                        <table className="table">
                                            <thead>
                                            <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Image</th>
                                                <th scope="col">Ticker</th>
                                                <th scope="col">Token ID</th>
                                                <th scope="col">Created By</th>
                                                <th scope="col"></th>
                                            </tr>
                                            </thead>
                                            <tbody>

                                                {
                                                    dataCoin?.map(idx => (
                                                        <tr key={idx.id}>
                                                            <td>
                                                                <Link to={`/token?token-id=${idx.tokenId}`}>
                                                                    {/*<img src={idx.icon} alt="rockie" />*/}
                                                                    <span>{idx.name}</span></Link>
                                                            </td>
                                                            <td className={`${idx.class}`}>
                                                                {idx.image ?
                                                                    <img className="token_image_detail"
                                                                         src={`${process.env.REACT_APP_BACKEND_URL}${idx.image.replace(/\\/g, '/')}`}
                                                                         style={{
                                                                             width: '48px',
                                                                             height: '48px'
                                                                         }}
                                                                         alt={idx.name}
                                                                    /> :
                                                                    <img className="token_image_detail"
                                                                         src={`${process.env.REACT_APP_BACKEND_URL}${'/uploads/hedera-hashgraph.png'}`}
                                                                         style={{
                                                                             width: '48px',
                                                                             height: '48px'
                                                                         }}
                                                                         alt={idx.name}
                                                                    />
                                                                }

                                                            </td>
                                                            <td className={`${idx.class}`}>{idx.ticker}</td>
                                                            <td className="token_id">{idx.tokenId}</td>
                                                            <td className="created_by">{idx.walletAddress}</td>
                                                            <td><Link to={`/token?token-id=${idx.tokenId}`}
                                                                      className="btn">Trade</Link></td>
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
            </section>
    );
}

export default Coinlist01;