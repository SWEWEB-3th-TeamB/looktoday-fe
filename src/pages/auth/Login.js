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
    e.preventDefault?.();
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
      localStorage.setItem("token", TOKEN); // 로컬스토리지에 토큰 저장

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
        <div className='login-form'>
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
          <Form type='password'
            name='password'
            placeholder='비밀번호'
            showEye
            required
            onErrorChange={setPasswordError}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='login-btn'>
          <AuthButton text='로그인' onClick={handleLoginClick} />
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
