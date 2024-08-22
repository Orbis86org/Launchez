import React , {useState} from 'react';
import PropTypes from 'prop-types';
import {Link } from 'react-router-dom';
import img1 from '../../assets/images/layout/banner-01.png'
import hedera from '../../assets/images/hedera.png'


import { Navigation, Scrollbar, A11y   } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/scss';
import 'swiper/scss/navigation';
import 'swiper/scss/pagination';
import Button from '../button';



Banner01.propTypes = {
    data: PropTypes.array,
};

function Banner01(props) {


    const {data} = props;

    const [dataBlock] = useState(
        {
            title: 'Buy & Sell Digital Crypto on Launchez',
            desc : 'Launchez is the easiest, safest, and fastest way to create, buy & sell crypto.',
            title2: 'Our Partners'
        }
    );
    return (
        <section className="banner">
                <div className="container">
                    <div className="row">
                    <div className="col-xl-6 col-md-12">
                        <div className="banner__content">
                        <h2 className="title">{dataBlock.title}</h2>
                        <p className="fs-20 desc">
                            {dataBlock.desc}
                        </p>
                        <Button title='Create New Token' path='/create' />
                        </div>
                    </div>
                    <div className="col-xl-6 col-md-12">
                        <div className="banner__image">
                        <img src={hedera} alt="Launchez" width={750} />
                        </div>
                    </div>
                    </div>
                </div>
            </section>
    );
}

export default Banner01;