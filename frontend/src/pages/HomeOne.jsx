import React, {useEffect, useState} from 'react';



import Banner01 from '../components/banner/Banner01';
import Crypto01 from '../components/crypto/Crypto01';
import Coinlist01 from '../components/coinlist/Coinlist01';
import Work01 from '../components/work/Work01';
import About01 from '../components/about/About01';
import Testimonial01 from '../components/testimonial/Testimonial01';
import Sale01 from '../components/sale/Sale01';
import dataPartner from '../assets/fake-data/data-partner';
import dataTestimonial from '../assets/fake-data/data-testimonial';
import dataWork from '../assets/fake-data/data-work';
import dataCoin from '../assets/fake-data/data-coin';
import Download01 from '../components/download/Download01';
import img1 from "../assets/images/icon/Cloud.png";
import img2 from "../assets/images/icon/Wallet.png";
import img3 from "../assets/images/icon/Mining.png";
import img4 from "../assets/images/icon/Comparison.png";
import HowItWorks from "../components/how-it-works/howItWorks";



function HomeOne(props) {

    const[tokens, setTokens] = useState( false );
    useEffect(  () => {
        async function fetchData() {
            if( ! tokens ){

                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                };

                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tokens`, requestOptions)
                    .then((response) => response.text())
                    .then( function( result ){
                        console.log( result )
                        result = JSON.parse( result );

                        console.log( result.data )

                        setTokens( result.data )
                    })
                    .catch((error) => console.error(error));

            }
        }

        fetchData();
    }, []);

    return (
        <div className='home-1'>

            <Banner01 data={dataPartner} />

            {/* <Crypto01 /> */}


            <HowItWorks />


            { tokens && (
                <Coinlist01 dataCoin={tokens} showHeading={ true } />
            )}

            {/*
            <Work01 data={dataWorkRowOne} data2={dataWorkRowTwo} showHeading={ true }/>

            <About01 />

            <Download01 />

            <Testimonial01 data={dataTestimonial} />

            <Sale01 />
            */}

        </div>
    );
}

export default HomeOne;