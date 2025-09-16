import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const handleLoginClick = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !isEmailValid || !password.trim()) return;
    if (emailError || passwordError) {
      return;
    }

    const payload = { email, password };

    try {
      const res = await fetch('http://43.203.195.97:3000/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.clone().json();
      } catch {
        data = {};
      }
      console.log("data", data);

      if (!res.ok) {
        if (data?.message === "비밀번호가 일치하지 않습니다." || data?.message === "존재하지 않는 계정입니다.") {
          alert(data.message);
        } else {
          console.error("로그인 실패:", data.message || "Unknown error");
        }
        return;
      }

      console.log("로그인", data);

      const TOKEN = data.result.token; // 토큰

      // 1. 토큰 저장
      localStorage.setItem("token", TOKEN);

      // 2. 토큰 발급 시각도 함께 저장 (24시간 체크용)
      localStorage.setItem("token_issued_at", Date.now().toString());

      console.log('저장된 token:', localStorage.getItem('token'));
      console.log('저장된 token_issued_at:', localStorage.getItem('token_issued_at'));

      navigate("/");

    } catch (error) {
      console.error("네트워크 오류:", error);
    }
  }

  return (
    <div className="wrap">
      <Menu />
      <div className='login'>
        <div className='login-title'>Login</div>
        <form className='login-form' onSubmit={handleLoginClick}>
          <Form
            type='email'
            name='email'
            placeholder='이메일'
            required
            value={email}
            onErrorChange={setEmailError}
            onChange={(e) => setEmail(e.target.value)}
            onValidChange={(ok) => setIsEmailValid(ok)}
          />
          <Form
            type='password'
            name='password'
            placeholder='비밀번호'
            showEye
            required
            onErrorChange={setPasswordError}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className='login-btn'>
            <AuthButton text='로그인' />
          </div>
        </form>
        <div className='login-links'>
          <div className='login-link'><a href='/sign-up'>회원가입</a></div>ㅣ<div className='login-link'><a href='/change-password'>비밀번호 찾기</a></div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
