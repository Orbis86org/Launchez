import React , {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Sale01 from '../components/sale/Sale01';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import PageTitle from '../components/pagetitle';
import {Link, useParams} from 'react-router-dom';
import img from '../assets/images/avt/avt.png'
import Coinlist01 from '../components/coinlist/Coinlist01';

UserProfile.propTypes = {
    
};

function UserProfile(props) {

    const[tokens, setTokens] = useState( false );
    const { id } = useParams();

    console.log(id);
    useEffect(  () => {
        async function fetchData() {
            if( id ){

                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                };

                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile?profile_id=${id}`, requestOptions)
                    .then((response) => response.text())
                    .then( function( result ){
                        result = JSON.parse( result );

                        setTokens( result.data )
                    })
                    .catch((error) => console.error(error));

            }
        }

        fetchData();
    }, []);


    const [dataCoinTab] = useState([
        /* {
            id: 1,
            title: 'User Profile',
            icon: 'fa-user'
        },
        {
            id: 2,
            title: 'Referrals',
            icon: 'fa-share-nodes'
        },
        {
            id: 3,
            title: 'API keys',
            icon: 'fa-gear'
        },
        {
            id: 4,
            title: '2FA',
            icon: 'fa-barcode'
        },
        {
            id: 5,
            title: 'Change password',
            icon: 'fa-lock'
        }, */
        {
            id: 6,
            title: 'Tokens',
            icon: 'fa-currency'
        },

    ]);
    return (
        <div>


            <PageTitle heading='User Profile' title='User' />


            <section className="user-profile flat-tabs">
            <div className="container">
                <div className="row">
                <Tabs>
                    
                    <TabList>
                        <div className="user-info center">
                            <div className="avt">
                                <input
                                type="file"
                                className="custom-file-input"
                                id="imgInp"
                                required
                                />
                                <img id="blah" src={img} alt="no file" />
                            </div>
                            <h6 className="name">{id}</h6>
                            <p>{`${id}@demo.com`}</p>
                        </div>
                        {
                            dataCoinTab.map(idx => (
                                <Tab key={idx.id}><h6 className="fs-16">
                                <i className={`fa ${idx.icon}`}></i>
                                {idx.title}
                                </h6></Tab>
                            ))
                        }

                    </TabList>

                    <TabPanel>
                        <div className="content-inner tokens">
                            <h4>User Tokens</h4>

                            { tokens && (
                                <div className="content-inner" style={{marginTop: "2rem"}}>
                                <table className="table" style={{color: "#fff"}}>
                                <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Image</th>
                                    <th scope="col">Ticker</th>
                                    <th scope="col">Token ID</th>
                                    {/* <th scope="col">Created By</th> */}
                                </tr>
                                </thead>
                                <tbody>

                                    {
                                        tokens?.map(idx => (
                                            <tr key={idx.id}>
                                                <td>
                                                    <Link to={`/token?token-id=${idx.tokenId}`}>
                                                        {/*<img src={idx.icon} alt="rockie" />*/}
                                                        <span>{idx.name}</span></Link>
                                                </td>
                                                <td className={`${idx.class}`}>
                                                    {idx.image ?
                                                        <img className="token_image_detail with"
                                                             src={`${process.env.REACT_APP_BACKEND_URL}/${idx.image.replace(/\\/g, '/')}`}
                                                             style={{
                                                                 width: '48px',
                                                                 height: '48px'
                                                             }}
                                                             alt={idx.name}
                                                        /> :
                                                        <img className="token_image_detail"
                                                             src={`${process.env.REACT_APP_BACKEND_URL}/uploads/hedera-hashgraph.png`}
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
                                                {/* <td className="created_by">{idx.walletAddress}</td> */}
                                            </tr>
                                        ))
                                    }

                                </tbody>
                                </table>
                                </div>
                            )}
                        </div>
                    </TabPanel>                    

                </Tabs> 
                </div>
            </div>
            </section>

            <Sale01 />
            
        </div>
    );
}

export default UserProfile;