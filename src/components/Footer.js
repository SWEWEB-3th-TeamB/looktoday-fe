import '../styles/Footer.css';

import logo from '../assets/images/logo-horizontal.png';
import instagram from '../assets/images/instagram.png';
import email from '../assets/images/email.png';
import company from '../assets/images/company.png';

const Footer = () => {
    return (
        <div className='footer'>
            <div className='footer-content'>
                <img className='footer-logo' src={logo} alt='logo-horizontal' />
                <div className='footer-table'>
                    <div className='footer-row'>
                        <div className='footer-role'>Frontend</div>
                        <div className='footer-member'>김민주</div>
                        <div className='footer-member'>이민주</div>
                        <div className='footer-member'>황은우</div>
                    </div>
                    <div className='footer-row'>
                        <div className='footer-role'>Backend</div>
                        <div className='footer-member'>김수영</div>
                        <div className='footer-member'>신정연</div>
                        <div className='footer-member'>오소윤</div>
                        <div className='footer-member'>이은서</div>
                        <div className='footer-member'>임세연</div>
                    </div>
                    <div className='footer-row'>
                        <div className='footer-role'>Contact Us</div>
                        <div className='footer-url'><img src={instagram} />swuweb@instagram.com</div>
                        <div className='footer-url'><img src={email} />swuweb0320@gmail.com</div>
                    </div>
                </div>
                <div className='footer-rights'>All rights reserved<img src={company} alt='company' />SWUWEB 3TH</div>
            </div>
        </div>
    );
};

export default Footer;