import React , {useState} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';




Coinlist01.propTypes = {
    dataCoin: PropTypes.array,
};

function Coinlist01(props) {

    const {dataCoin} = props;

    const [dataCoinTab] = useState([
        {
            id: 1,
            title: 'View All',
        },
        {
            id: 2,
            title: 'Metaverse',
        },
        {
            id: 3,
            title: 'Entertainment',
        },
        {
            id: 4,
            title: 'Energy',
        },
        {
            id: 5,
            title: 'NFT',
        },
        {
            id: 6,
            title: 'Gaming',
        },
        {
            id: 7,
            title: 'Music',
        },
    ]);


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
                        {/*}
                            <TabList>
                                {
                                    dataCoinTab.map(idx => (
                                        <Tab key={idx.id}>{idx.title}</Tab>
                                    ))
                                }

                            </TabList>
                        */}

                            {
                                dataCoin.map(data => (
                                    <TabPanel key={data.id}>
                                        <div className="content-inner">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Name</th>
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
                                                            <td className={`${idx.class}`}>{idx.ticker}</td>
                                                            <td className="token_id">{idx.tokenId}</td>
                                                            <td className="created_by">{idx.walletAddress}</td>
                                                            <td><Link to={ `/token?token-id=${idx.tokenId}`} className="btn">Trade</Link></td>
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