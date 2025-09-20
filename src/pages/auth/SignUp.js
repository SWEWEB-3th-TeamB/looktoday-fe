import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import Menu from '../../components/Menu';
import Form from '../../components/Form';
import RegionSelector from '../../components/RegionSelector';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import '../../styles/SignUp.css';

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

    // 생년월일
    const [birthDigits, setBirthDigits] = useState("");
    const onlyDigits = (v = "") => (v || "").replace(/\D/g, "");

    const formatBirthForInput = (digits = "") => {
        const d = onlyDigits(digits).slice(0, 8);
        const y = d.slice(0, 4);
        const m = d.slice(4, 6);
        const day = d.slice(6, 8);
        let out = y;
        if (m) out += "/" + m;
        if (day) out += "/" + day;
        return out;             // 화면 표시용: 1999/01/01
    };

    const formatBirthForServer = (digits = "") => {
        const d = onlyDigits(digits);
        if (d.length !== 8) return null;
        const y = parseInt(d.slice(0, 4), 10);
        const m = parseInt(d.slice(4, 6), 10);
        const day = parseInt(d.slice(6, 8), 10);
        if (y < 1900 || y > 2100) return null;
        if (m < 1 || m > 12) return null;
        if (day < 1 || day > 31) return null;
        return `${String(y)}/${String(m).padStart(2, "0")}/${String(day).padStart(2, "0")}`; // 서버용
    };


    // 최종 전송 전 검증/정규화: 잘못된 월/일이면 null 반환
    const normalizeBirthForSubmit = (v = "") => {
        const d = onlyDigits(v);
        if (d.length !== 8) return null;
        const y = parseInt(d.slice(0, 4), 10);
        const m = parseInt(d.slice(4, 6), 10);
        const day = parseInt(d.slice(6, 8), 10);

        // 간단 검증 (필요하면 윤년/각 달 일수까지 더 엄밀하게 체크 가능)
        if (y < 1900 || y > 2100) return null;
        if (m < 1 || m > 12) return null;
        if (day < 1 || day > 31) return null;

        const mm = String(m).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${y}/${mm}/${dd}`;
    };

    const navigate = useNavigate();

    // 이메일 중복확인
    const handleCheckEmail = async () => {
        if (!email.trim() || !isValidEmail(email)) return;

        setEmailCheckMsg('');
        setEmailCheckOk(null);
        setEmailLoading(true);

        try {
            const res = await fetch(
                `/api/auth/check-email?email=${encodeURIComponent(email)}`,
                { method: 'GET' }
            );
            const data = await res.json().catch(() => ({}));

            console.log("✅ check-email response:", res.status, data);

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

    // 닉네임 중복확인
    const handleCheckNickname = async () => {
        if (!nickname.trim()) return;

        setNicknameCheckMsg('');
        setNicknameCheckOk(null);
        setNickLoading(true);

        try {
            const res = await fetch(
                `/api/auth/check-username?nickname=${encodeURIComponent(nickname)}`,
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

    // 회원가입 버튼 클릭시
    const handleSubmit = async (e) => {
        e.preventDefault?.();

        // 생년월일 필수 체크
        if (!birthDigits.trim()) {
            const msg = "생년월일은 필수 입력값입니다.";
            setServerError(msg);
            alert(msg);
            return;
        }

        // 생년월일 형식 변환 및 검증
        const birthForServer = formatBirthForServer(birthDigits);
        if (!birthForServer) {
            const msg = "생년월일 형식이 올바르지 않습니다. YYYY/MM/DD로 입력해주세요.";
            setServerError(msg);
            alert(msg);
            return;
        }

        // 서버로 보낼 데이터 구성
        const payload = {
            email,
            password,
            confirmPassword,
            nickname,
            birth: birthForServer, // 항상 YYYY/MM/DD 형식으로 서버 전송
            si,
            gungu
        };

        console.log("회원가입 payload:", payload);

        try {
            const res = await fetch(`/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            let data;
            try {
                data = await res.clone().json();
            } catch {
                data = { raw: await res.text() };
            }
            console.log("signup response", res.status, data);

            // 서버 응답이 실패일 경우
            if (!res.ok) {
                alert(data?.message || "회원가입 실패");
                return;
            }

            // 회원가입 성공 시
            navigate("/sign-up-complete");
        } catch (error) {
            console.error(error);
            alert("네트워크 오류 발생");
        }
    };

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
                        <label>생년월일*</label>
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

                        <Form type='text' name='birth' placeholder='생년월일 (YYYY/MM/DD)' required
                            value={birth} onChange={(e) => {
                                const formatted = formatBirthForInput(e.target.value);
                                setBirth(formatted);
                                setBirthDigits(e.target.value);
                            }} />
                        <RegionSelector
                            onRegionSelect={({ sido, gugun }) => {
                                setSi(sido);
                                setGungu(gugun);
                            }}
                        />
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