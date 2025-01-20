import React , {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Sale01 from '../components/sale/Sale01';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import PageTitle from '../components/pagetitle';
import {Link, useParams} from 'react-router-dom';
import img from '../assets/images/avt/avt.png'
import Coinlist01 from '../components/coinlist/Coinlist01';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

UserProfile.propTypes = {
    
};

function UserProfile(props) {

    const[tokens, setTokens] = useState( false );
    const[profileData, setProfileData] = useState( [] );
    const[buttonLoader, setButtonLoader] = useState( false );
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        bio: '',
        twitter: '',
        facebook: '',
        walletAddress: '',
        image: null,  // for image upload
      });
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

    useEffect(  () => {
        async function fetchProfileData() {
            if( id ){

                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                };

                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile-details?profile_id=${id}`, requestOptions)
                    .then((response) => response.json())
                    .then( function( result ){
                        //result = JSON.parse( result );
                        setProfileData( result.data || [] )
                        setFormData({
                            nickname: result?.data?.nickname || '',
                            email: result?.data?.email || '',
                            bio: result?.data?.bio || '',
                            twitter: result?.data?.twitter || '',
                            facebook: result?.data?.facebook || '',
                            walletAddress: result?.data?.walletAddress || '',
                            image: null, // Don't auto-fill the image
                        });
                        
                    })
                    .catch((error) => console.error(error));

            }
        }

        fetchProfileData();
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
            title: 'Created Tokens',
            icon: 'fa-currency'
        },
        {
            id: 7,
            title: 'Held tokens',
            icon: 'fa-currency'
        },
        {
            id: 8,
            title: 'Transactions',
            icon: 'fa-currency'
        },
        {
            id: 9,
            title: 'Edit Profile',
            icon: 'fa-currency'
        },

    ]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prevData) => ({ ...prevData, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted with data:", formData, id, typeof id); // Debugging log
        const form = new FormData();
        form.append('walletAddress', id.toString());

        // Append form data
        for (let key in formData) {
            form.append(key, formData[key]);
        }
        
        try{
            setButtonLoader(true);
            const requestOptions = {
                method: profileData?.walletAddress ? 'PUT' : 'POST',
                body: form,
            };

            const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/user-profile${profileData ? `?profile_id=${id}` : ''}`,
                requestOptions
            );
            const result = await response.json();

            if (result.success) {
                // Handle success (e.g., show a message, redirect, etc.)
                setProfileData( result.data || [] )
                setFormData({
                    nickname: result?.data?.nickname || '',
                    email: result?.data?.email || '',
                    bio: result?.data?.bio || '',
                    twitter: result?.data?.twitter || '',
                    facebook: result?.data?.facebook || '',
                    walletAddress: result?.data?.walletAddress || '',
                    image: result?.data?.image || null, // Don't auto-fill the image
                });
                toast.success("Profile updated...!!!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            } else {
                // Handle error (e.g., show an error message)
                toast.error("Something Went wrong", {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        }
        catch(e){
            toast.error("Something Went wrong", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
        finally{
            setButtonLoader(false);
        }
    };

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
                               {/*  <input
                                type="file"
                                className="custom-file-input"
                                id="imgInp"
                                required
                                /> */}
                                <img
                                    id="profile-pic"
                                    src={profileData?.image && profileData?.image !== null ? `${process.env.REACT_APP_BACKEND_URL}${profileData?.image?.replace(/\\/g, '/')}` : `${process.env.REACT_APP_BACKEND_URL}/uploads/profileplaceholder.jpeg`}
                                    alt="profile-pic"
                                />
                                
                            </div>
                            <h6 className="name">{formData?.nickname ? `${formData?.nickname} (${id})` : id }</h6>
                            {formData?.email ?? <p>{formData?.email}</p>}
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
                        <div className="content-inner created-tokens">
                            <h4>User Created Tokens</h4>

                            { tokens?.length > 0 ? (
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
                            )
                        :
                        <p>No tokens are created.!!</p>}
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="content-inner held-tokens">
                            <h4>User Held Tokens</h4>

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
                                </tbody>
                                </table>
                                </div>
                            )}
                        </div>
                    </TabPanel>   
                    <TabPanel>
                        <div className="content-inner transactions">
                            <h4>User Transaction</h4>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="content-inner profile change-pass">
                            <h4>Edit Profile</h4>
                            {/* <h6>New Passworld</h6> */}
                            <Form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <div>
                                    <label>Name:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder='Name'
                                        name="nickname"
                                        value={formData.nickname}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div>
                                    <label>Email:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder='Email'
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div style={{width: '100%'}}>
                                    <label>Bio:</label>
                                    <textarea
                                        type="text"
                                        className="form-control"
                                        placeholder='Share something about your self'
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                    />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div>
                                    <label>Twitter:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder='Twitter URL'
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div>
                                    <label>Facebook:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder='Facebook URL'
                                        name="facebook"
                                        value={formData.facebook}
                                        onChange={handleChange}
                                    />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div>
                                    <label>Profile Image:</label>
                                    <input
                                        type="file"
                                        name="image"
                                        className="form-control"
                                        onChange={handleFileChange}
                                    />
                                    </div>
                                </div>
                                
                            <button type="submit" className="btn-action">
                                {buttonLoader ? "Loading..." : "Update Profile" }
                            </button>
                            </Form>
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