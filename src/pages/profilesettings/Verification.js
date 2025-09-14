import { useState } from 'react';

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/ChangePassword.css';

const Verification = () => {
    const [email, setEmail] = useState('');
    const [birth, setBirth] = useState('');
    return (
        <div className="wrap">
            <Menu />
            <div className='change-password'>
                <div className='change-password-title'>Change Password</div>
                <div className='change-password-form'>
                    <div className='change-password-labels'>
                        <label>이메일</label>
                        <label>생년월일</label>
                    </div>
                    <div className='change-password-inputs'>
                        <Form type="email" value={email} placeholder='이메일' onChange={(e) => setEmail(e.target.value)} />
                        <Form type="text" placeholder='생년월일' value={birth} onChange={(e) => setBirth(e.target.value)} />
                    </div>
                </div>
                <div className='change-password-btn'>
                    <AuthButton to='/change-password' text='다음' />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Verification;