import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {TabPanel, Tabs} from "react-tabs";
import img from "../../assets/images/layout/contact.jpg";

function TopHolders({tokenId}) {

    const[topHolders, setTopHolders] = useState([]);

    useEffect(  () => {
        async function fetchData() {
            if( topHolders.length === 0 ){

                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                };

                fetch(`https://${process.env.REACT_APP_HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/tokens/${tokenId}/balances`, requestOptions)
                    .then((response) => response.text())
                    .then( function( result ){

                        result = JSON.parse( result );

                        setTopHolders( result.balances)
                    })
                    .catch((error) => console.error(error));

            }
        }

        fetchData();
    }, [tokenId]);

    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="">
                            <Tabs>
                                {
                                    topHolders.map(data => (
                                        <TabPanel key={data.id}>
                                            <div className="content-inner">
                                                <table className="table">
                                                    <thead>
                                                    <tr>
                                                        <th scope="col" style={{color: 'var(--onsurface)'}}>Account</th>
                                                        <th scope="col" style={{color: 'var(--onsurface)'}}>Balance</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>

                                                    {
                                                        topHolders?.map(idx => (

                                                            <tr key={idx.account}>
                                                                <td style={{color: 'var(--text)'}}>
                                                                    <Link to={`/profile/${idx.account}`}>
                                                                        {idx.account}
                                                                    </Link>
                                                                </td>
                                                                <td style={{color: 'var(--text)'}}>
                                                                    { Number(idx.balance/Math.pow( 10, idx.decimals ) ).toLocaleString()}
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

export default TopHolders;
