import { useState } from 'react';

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import RegionSelector from '../../components/RegionSelector';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/ChangePassword.css';

const ChangePassword = () => {
  const [selectedRegion, setSelectedRegion] = useState('');

  return (
    <div className="wrap">
      <Menu />
      <div className='change-password'>
        <div className='change-password-title'>Change Password</div>
        <div className='change-password-form'>
          <div className='change-password-labels'>
            <label>현재 비밀번호</label>
            <label>새 비밀번호</label>
            <label>새 비밀번호 확인</label>
          </div>
          <div className='change-password-inputs'>
            <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
            <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
            <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
          </div>
        </div>
        <div className='change-password-btn'>
          <AuthButton to='/change-password-complete' text='완료' />
        </div>
        <div className='change-password-links'>
          <div className='change-password-link'><a href='/login'>로그인</a></div>ㅣ<div className='login-link'><a href='/sign-up'>회원가입</a></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ChangePassword;