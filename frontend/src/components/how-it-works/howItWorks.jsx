import React , {useState} from 'react';


import {Link} from 'react-router-dom';
import img1 from '../../assets/images/icon/googleplay.png'
import img2 from '../../assets/images/icon/appstore.png'
import img3 from '../../assets/images/layout/download.png'
import hedera from "../../assets/images/hedera.png";
import howitworks from "../../assets/images/how-it-works.png";


function HowItWorks(props) {

    const [dataBlock] = useState(
        {
            heading: 'How It Works',
            desc : 'Learn how we do it',
        }
    );

    const [dataList] = useState([
        {
            title: 'Step One',
            text: 'Pick a coin that you like.'
        },
        {
            title: 'Step Two',
            text: 'Buy the coin on the bonding curve.'
        },
        {
            title: 'Step Three',
            text: 'Sell at any time to lock in your profits or losses.'
        },
        {
            title: 'Step Four',
            text: 'When enough people buy on the bonding curve it reaches a market cap of $69k.'
        },
        {
            title: 'Step Five',
            text: 'Pick a coin that you like.'
        },
    ])

    return (
        <section className="download">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div
                            className="download__content"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                        >
                            <h3 className="heading center">{dataBlock.heading}</h3>
                            <p className="fs-20 decs center">
                                {dataBlock.desc}
                            </p>

                            <div className='row d-flex align-items-center'>
                                <div className='col-6'>
                                    <ul className="list">

                                        {
                                            dataList.map((data,idx) =>(
                                                <li key={idx}>
                                                    <h6 className="title">
                                                        <span className="icon-check"></span>{data.title}
                                                    </h6>
                                                    <p className="text">
                                                        {data.text}
                                                    </p>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>

                                <div className='col-6'>
                                    <img src={howitworks} alt="Launchez" width={750} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;