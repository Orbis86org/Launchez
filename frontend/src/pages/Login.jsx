import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import avt1 from '../assets/images/author/author-login-1.png'
import avt2 from '../assets/images/author/author-login-2.png'

Login.propTypes = {
    
};

function Login(props) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { username, password } = formData;
    const [loginError, setLoginError] = useState(false); 
    const navigate = useNavigate();

    const onChange = e => { 
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLoginError(false);
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
        //const res = await axios.post('http://localhost:5000/api/auth/login', formData);
        const resFetch = await fetch("http://localhost:5000/api/auth/login",
            {
                body: JSON.stringify(formData),
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
        const jsonData = await resFetch?.json();
        console.log("JSON Data: ", jsonData);
        if(jsonData?.token){
            console.log('Login successful!');
            localStorage.setItem('token', jsonData?.token);
            window.location.href = '/dashboard';
            //navigate('/dashboard');
        }
        else{
            setLoginError(true);
        }
        } catch (err) {
            console.log('Login failed!', err);
            setLoginError(true);
        }
    };

    return (
        <div>

<section className="tf-page-title style-2">    
                <div className="tf-container">
                    <div className="row">
                        <div className="col-md-12">

                            <ul className="breadcrumbs">
                                <li><Link to="/blog-v2">Home</Link></li>
                                <li>Login</li>
                            </ul>
                   
                        </div>
                    </div>
                </div>                    
            </section>
                
            <section className="tf-login">
                <div className="tf-container">
                    <div className="row justify-content-center">
                        <div className="col-md-12">
                            <div className="tf-heading style-5">
                                <h4 className="heading">Creat, Sell Or Collect Digital Item</h4>
                                <p className="sub-heading">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. </p>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-8 col-md-12">
                            <form onSubmit={onSubmit} id="contactform">
                               <fieldset>
                                    <input onChange={onChange} value={username} id="username" name="username" tabindex="1" aria-required="true" required="" type="text" placeholder="User name" />
                                </fieldset>
                               <fieldset className="mb24">
                                    <input id="showpassword" onChange={onChange} name="password" value={password} tabindex="2" aria-required="true"  type="password" placeholder="Password" required="" />
                                    <span className="btn-show-pass "><i className="far fa-eye-slash"></i></span>
                                </fieldset>
                                <div className="forgot-pass-wrap">
                                    <label>Remember for 30 days
                                        <input type="checkbox" />
                                        <span className="btn-checkbox"></span>
                                    </label>
                                    <a className="forgot-pass" href="/login">Fogot password?</a>
                                </div>
                                {loginError && <div style={{"marginTop": "24px", "marginBottom": "24px"}} className="text-center text-danger">Login Failed. Please enter correct details.</div> }
                                <button className="submit mb" type="submit">Login</button>
                                
                                <div style={{"marginTop": "24px"}} className="text-center">Don't have an account? <span><Link to="/signup" >Signup</Link></span></div>
                            </form>
                        
                            
                        </div>
                    </div>
                </div>
            </section>
            
        </div>
    );
}

export default Login;