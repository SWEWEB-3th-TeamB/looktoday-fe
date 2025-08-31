import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import RegionSelector from '../../components/RegionSelector';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/SignUp.css';

const API_BASE = 'http://43.203.195.97:3000';

const SignUp = () => {
    const [selectedRegion, setSelectedRegion] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [birth, setBirth] = useState('');
    const [si, setSi] = useState('');
    const [gungu, setGungu] = useState('');

    const [emailLoading, setEmailLoading] = useState(false);
    const [nickLoading, setNickLoading] = useState(false);

    const [emailCheckMsg, setEmailCheckMsg] = useState('');
    const [emailCheckOk, setEmailCheckOk] = useState(null);

    const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');
    const [nicknameCheckOk, setNicknameCheckOk] = useState(null);

    const [serverError, setServerError] = useState('');

    const [isEmailValid, setIsEmailValid] = useState(false);

    const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

    const navigate = useNavigate();

    // 이메일 중복확인
    const handleCheckEmail = async () => {
        if (!email.trim() || !isValidEmail(email)) return;

        setEmailCheckMsg('');
        setEmailCheckOk(null);
        setEmailLoading(true);

        try {
            const res = await fetch(
                `${API_BASE}/api/auth/check-email?email=${encodeURIComponent(email)}`,
                { method: 'GET' }
            );
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = data?.message || '이메일 중복확인에 실패했습니다.';
                setEmailCheckMsg(msg);
                setEmailCheckOk(false);
                alert(msg);
                return;
            }

            const ok = !!data?.isAvailable;
            const msg = data?.message ?? (ok ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.');
            setEmailCheckOk(ok);
            setEmailCheckMsg(msg);
            alert(msg);
        } catch (e) {
            const msg = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
            setEmailCheckMsg(msg);
            setEmailCheckOk(false);
            alert(msg);
        } finally {
            setEmailLoading(false);
        }
    };


    const handleCheckNickname = async () => {
        if (!nickname.trim()) return;

        setNicknameCheckMsg('');
        setNicknameCheckOk(null);
        setNickLoading(true);

        try {
            const res = await fetch(
                `${API_BASE}/api/auth/check-username?nickname=${encodeURIComponent(nickname)}`,
                { method: 'GET' }
            );
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = data?.message || '닉네임 중복확인에 실패했습니다.';
                setNicknameCheckMsg(msg);
                setNicknameCheckOk(false);
                alert(msg);
                return;
            }

            const ok = !!data?.isAvailable;
            const msg = data?.message ?? (ok ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.');
            setNicknameCheckOk(ok);
            setNicknameCheckMsg(msg);
            alert(msg);

        } catch (e) {
            const msg = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
            setNicknameCheckMsg(msg);
            setNicknameCheckOk(false);
            alert(msg);
        } finally {
            setNickLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault?.(); // 기본 이동 막기
        const payload = {
            email,
            password,
            confirmPassword,
            nickname,
            birth,
            si,
            gungu
        };
        console.log("회원가입", payload);

        try {
            const res = await fetch(`${API_BASE}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            console.log("data", data);

            if (!res.ok) {
                alert(data?.message || "회원가입 실패");
                return;
            }

            // 성공시 바로 이동
            navigate("/sign-up-complete");
        } catch (error) {
            console.error(error);
            alert("네트워크 오류 발생");
        }
    }

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
                        <Form
                            type='email'
                            name='email'
                            placeholder='이메일'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onValidChange={(ok) => setIsEmailValid(ok)}
                        />
                        <Form type='password' name='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye required
                            value={password} onChange={(e) => setPassword(e.target.value)} />

                        <Form type='password' name='confirmPassword' placeholder='비밀번호 확인' showEye required
                            value={confirmPassword} compareWith={password} onChange={(e) => setConfirmPassword(e.target.value)} />

                        <Form type='text' name='nickname' placeholder='닉네임' required
                            value={nickname} onChange={(e) => setNickname(e.target.value)} />

                        <Form type='text' name='birth' placeholder='생년월일 임시'
                            value={birth} onChange={(e) => setBirth(e.target.value)} />
                        <RegionSelector onRegionChange={(value, kind) => {
                            if (kind === 'sido') { setSi(value); setGungu(''); }
                            if (kind === 'gugun') { setGungu(value); }
                        }} />
                    </div>
                    <div className='sign-up-check-btn'>
                        {/* 이메일 */}
                        <div
                            className="check-btn"
                            onClick={(!emailLoading && emailCheckOk !== true) ? handleCheckEmail : undefined}
                            role="button"
                            style={{ cursor: (emailLoading || emailCheckOk === true) ? 'not-allowed' : 'pointer', opacity: (emailLoading || emailCheckOk === true) ? 0.7 : 1 }}
                            aria-disabled={emailLoading || emailCheckOk === true}
                            aria-label="이메일 중복확인"
                        >
                            {emailCheckOk === true ? '확인완료' : (emailLoading ? '확인중...' : '중복확인')}
                        </div>

                        {/* 닉네임 */}
                        <div
                            className="check-btn"
                            onClick={(!nickLoading && nicknameCheckOk !== true) ? handleCheckNickname : undefined}
                            role="button"
                            style={{ cursor: (nickLoading || nicknameCheckOk === true) ? 'not-allowed' : 'pointer', opacity: (nickLoading || nicknameCheckOk === true) ? 0.7 : 1 }}
                            aria-disabled={nickLoading || nicknameCheckOk === true}
                            aria-label="닉네임 중복확인"
                        >
                            {nicknameCheckOk === true ? '확인완료' : (nickLoading ? '확인중...' : '중복확인')}
                        </div>
                    </div>

                </div>
                <div className='sign-up-btn'>
                    <AuthButton text='회원가입' onClick={handleSubmit} />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default SignUp;