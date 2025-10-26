import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/ChangePassword.css';

const Verification = () => {
    const [email, setEmail] = useState('');
    const [birth, setBirth] = useState('');

    const [isEmailValid, setIsEmailValid] = useState(false);
    const [emailError, setEmailError] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const onlyDigits = (s = '') => s.replace(/\D/g, '');

    // 입력 시 보여줄 포맷: YYYY/MM/DD
    const formatBirthForInput = (input = '') => {
        const d = onlyDigits(input).slice(0, 8);
        const y = d.slice(0, 4);
        const m = d.slice(4, 6);
        const day = d.slice(6, 8);
        let out = y;
        if (m) out += '/' + m;
        if (day) out += '/' + day;
        return out;
    };

    // 서버로 보낼 포맷: YYYY-MM-DD
    const birthToISO = (input = '') => {
        const d = onlyDigits(input);
        if (d.length !== 8) return null;
        return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    };

    const handleVerificationClick = async (e) => {
        e.preventDefault();
        if (submitting) return;

        // 간단 검증
        if (!email.trim() || !isEmailValid) {
            alert(emailError || '올바른 이메일을 입력하세요.');
            return;
        }
        if (!birth.trim()) {
            alert('생년월일을 입력하세요.');
            return;
        }
        const birthISO = birthToISO(birth);
        if (!birthISO) {
            alert('형식은 YYYY/MM/DD 입니다.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/auth/verify-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, birth: birthISO }),
                credentials: 'include',   // 쿠키 받기
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                // 서버에서 내려주는 에러 메시지 그대로 노출
                alert(data?.message || '본인확인에 실패했습니다.');
                return;
            }

            // 성공: 메시지 안내 후 비밀번호 변경 페이지로 이동
            // 필요하면 email을 state/쿼리로 전달해 다음 페이지에서 재사용
            alert(data?.message || '본인 확인이 완료되었습니다.');
            navigate('/change-password', { state: { email } });
        } catch (err) {
            console.error('네트워크 오류:', err);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div className="wrap">
            <Menu />
            <div className='change-password'>
                <div className='change-password-title'>Change Password</div>
                <div className='change-password-form' onSubmit={handleVerificationClick}>
                    <div className='change-password-labels'>
                        <label>이메일</label>
                        <label>생년월일</label>
                    </div>
                    <div className='change-password-inputs'>
                        <Form
                            type="email"
                            name="email"
                            placeholder="이메일"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onValidChange={setIsEmailValid}
                            onErrorChange={setEmailError}
                        />
                        <Form
                            type="text"
                            name="birth"
                            placeholder="생년월일 (YYYY/MM/DD)"
                            required
                            value={birth}
                            onChange={(e) => setBirth(formatBirthForInput(e.target.value))}
                        />
                    </div>
                </div>
                <div className='change-password-btn'>
                    <AuthButton
                        text={submitting ? ' ' : '다음'}
                        onClick={handleVerificationClick}
                        disabled={submitting}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Verification;