import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

SignUp.propTypes = {
    
};

function SignUp(props) {
    return (
        <div>

<section className="tf-page-title style-2">    
                <div className="tf-container">
                    <div className="row">
                        <div className="col-md-12">
                            <ul className="breadcrumbs">
                                <li><Link to="/blog-v2">Home</Link></li>
                                <li>Sign Up</li>
                            </ul>
                   
                        </div>
                    </div>
                </div>                    
            </section>
                
            <section className="tf-login">
                <div className="tf-container">
                    <div className="row justify-content-center">
                        <div className="col-md-12">
                            <div className="tf-heading style-2">
                                <h4 className="heading">Sign Up To Orbis86</h4>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-9 col-md-12">
                            <form action="#" id="contactform">
                                <fieldset><input id="name" name="name" tabindex="1" aria-required="true" required="" type="text" placeholder="User name" /></fieldset>
                               <fieldset> <input id="showpassword" name="password" tabindex="2" aria-required="true"  type="password" placeholder="Password" required="" />
                                <span className="btn-show-pass"><i className="far fa-eye-slash"></i></span></fieldset>
                                <fieldset className="mb24"> <input id="showpassword2" name="password" tabindex="2" aria-required="true"  type="password" placeholder="Confirm password" required="" />
                                    <span className="btn-show-pass2"><i className="far fa-eye-slash"></i></span></fieldset>
                                <div className="forgot-pass-wrap">
                                    <label>I agree to the terms and services
                                        <input type="checkbox" />
                                        <span className="btn-checkbox"></span>
                                    </label>
                                </div>
                                
                                <button className="submit" type="submit">Signup</button>
                            </form>
                        
                            
                        </div>
                    </div>
                </div>
            </section>
            
        </div>
    );
}

export default SignUp;