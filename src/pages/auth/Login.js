import Menu from '../../components/Menu';
import Form from '../../components/Form';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/Login.css';

const Login = () => {
  return (
    <div className="wrap">
      <Menu />
      <div className='login'>
        <div className='login-title'>Login</div>
        <div className='login-form'>
          <Form type='email' placeholder='이메일' />
          <Form type='password' placeholder='비밀번호'  showEye={true}/>
        </div>
        <div className='login-btn'>
          <AuthButton text='로그인' />
        </div>
        <div className='login-links'>
          <div className='login-link'><a href='/sign-up'>회원가입</a></div>ㅣ<div className='login-link'>비밀번호 찾기</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
