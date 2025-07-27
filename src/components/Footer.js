import React from 'react';
import '../styles/Footer.css';

import logo from '../assets/images/logo-horizontal.png';

const Footer = () => {
    return (
        <div className='footer'>
            <div className='footer-content'>
                <img src={logo} alt='logo-horizontal'/>
                <div className='footer-role'>Frontend</div>
            </div>
        </div>
    );
};

export default Footer;