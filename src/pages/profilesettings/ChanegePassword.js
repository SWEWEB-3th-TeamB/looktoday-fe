import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/ChangePassword.css';

// 민감 필드 마스킹(로그 확인용)
const redact = (obj) =>
  JSON.parse(JSON.stringify(obj, (k, v) =>
    ['newPassword', 'confirmPassword'].includes(k) ? '********' : v
  ));

const ChangePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromPrev = location.state?.email; // Verification에서 전달된 email

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 우회 접근 가드
  useEffect(() => {
    if (!emailFromPrev) navigate('/verification', { replace: true });
  }, [emailFromPrev, navigate]);

  const submit = async () => {
    if (submitting) return;

    if (!pw || pw.length < 8) {
      alert('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (pw !== pw2) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const payload = { newPassword: pw, confirmPassword: pw2 };

    console.groupCollapsed('[POST /api/auth/reset-password] Request');
    console.log('payload', redact(payload));
    console.groupEnd();

    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',   // 쿠키 보내기
      });

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = {}; }

      console.groupCollapsed('[POST /api/auth/reset-password] Response');
      console.log('status', res.status);
      console.log('data', data);
      console.groupEnd();

      if (!res.ok) {
        alert(data?.message || '비밀번호 변경에 실패했습니다.');
        return;
      }

      alert(data?.message || '비밀번호 변경이 완료되었습니다.');
      navigate('/change-password-complete', { replace: true });
    } catch (err) {
      console.error(err);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 폼 없이 Enter 제출 처리
  const handleEnterKey = (e) => {
    if (e.isComposing) return; // 한글 IME 조합 중 Enter 무시(선택)
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  if (!emailFromPrev) return null;

  return (
    <div className="wrap" onKeyDownCapture={handleEnterKey}>
      <Menu />
      <div className="change-password">
        <div className="change-password-title">Change Password</div>

        <div className="change-password-form">
          <div className="change-password-labels">
            <label>새 비밀번호</label>
            <label>새 비밀번호 확인</label>
          </div>

          <div className="change-password-inputs">
            <Form
              type="password"
              name="password"
              placeholder="비밀번호 (8자 이상)"
              showEye
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={handleEnterKey}
            />
            <Form
              type="password"
              name="confirmPassword"
              placeholder="비밀번호 확인"
              showEye
              required
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              onKeyDown={handleEnterKey}
              compareWith={pw}
              validateOnChange
            />
          </div>
        </div>

        <div className="change-password-btn">
          <AuthButton
            text={submitting ? ' ' : '완료'}
            onClick={submit}
            disabled={submitting}
          />
        </div>

        <div className="change-password-links">
          <div className="change-password-link"><a href="/login">로그인</a></div>
          ㅣ
          <div className="login-link"><a href="/sign-up">회원가입</a></div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChangePassword;
