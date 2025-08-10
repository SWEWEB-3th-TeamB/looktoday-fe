import { useState } from 'react';

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import RegionSelector from '../../components/RegionSelector';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/SignUp.css';

const SignUp = () => {
    const [selectedRegion, setSelectedRegion] = useState('');

    return (
        <div className="wrap">
            <Menu />
            <div className='sign-up'>
                <div className='sign-up-title'>Sign Up</div>
                <div className='sign-up-notice'>*필수 입력 사항</div>
                <hr />
                <div className='sign-up-form'>
                    <div className='sign-up-labels'>
                        <label>이메일*</label>
                        <label>비밀번호*</label>
                        <label>비밀번호 확인*</label>
                        <label>닉네임*</label>
                        <label>생년월일</label>
                        <label>위치*</label>
                    </div>
                    <div className='sign-up-inputs'>
                        <Form type='email' placeholder='이메일' />
                        <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true}/>
                        <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true}/>
                        <Form type='text' placeholder='닉네임' />
                        <Form type='text' placeholder='생년월일 임시' />
                        <RegionSelector onRegionChange={setSelectedRegion}/>
                    </div>
                    <div className='sign-up-check-btn'>
                        <div className='check-btn'>중복확인</div>
                        <div className='check-btn'>중복확인</div>
                    </div>
                </div>
                <div className='sign-up-btn'>
                    <AuthButton to='/sign-up-complete' text='회원가입' />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default SignUp;