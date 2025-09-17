import { useState, useEffect } from 'react';

import Menu from '../../components/Menu';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import Form from '../../components/Form';
import RegionSelector from '../../components/RegionSelector';

import Completeicon from '../../assets/images/complete.png';
import '../../styles/Profile.css';

const API_BASE = 'http://43.203.195.97:3000';

/** localStorage에 따옴표가 섞여 저장된 경우까지 방어적으로 읽기 */
const getToken = () => {
  const raw = localStorage.getItem('token');
  if (!raw) return null;
  try { return raw.startsWith('"') ? JSON.parse(raw) : raw; } catch { return raw; }
};

/** JWT payload 디버깅 */
const debugJwt = (t) => {
  if (!t) return;
  try {
    const base64Url = t.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    console.log('[jwt payload]', payload);
    return payload;
  } catch (e) {
    console.warn('JWT 파싱 실패', e);
    return null;
  }
};

/** ---- 생년월일 유틸 ---- */
/** 서버값/사용자 입력 → 입력표시값 (YYYY/MM/DD) */
const formatBirthForInput = (input = "") => {
  const d = onlyDigits(input).slice(0, 8);
  const y = d.slice(0, 4);
  const m = d.slice(4, 6);
  const day = d.slice(6, 8);
  let out = y;
  if (m) out += "/" + m;
  if (day) out += "/" + day;
  return out; // 2003/05/02 형태(부분 입력도 자연스럽게)
};
/** 입력값 → 서버전송값 (YYYY-MM-DD) */
const formatBirthForServer = (v = "") => {
  const d = onlyDigits(v);
  if (d.length !== 8) return null;
  const y = parseInt(d.slice(0, 4), 10);
  const m = parseInt(d.slice(4, 6), 10);
  const day = parseInt(d.slice(6, 8), 10);
  if (y < 1900 || y > 2100) return null;
  if (m < 1 || m > 12) return null;
  if (day < 1 || day > 31) return null;
  // 서버 스펙: YYYY-MM-DD
  return `${String(y)}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/** 새비번/확인이 모두 비어 있으면 현재비번으로 채워서 서버로 보냄 */
const resolveNewPasswordFields = (current = "", next = "", confirm = "") => {
  const n = (next || "").trim();
  const c = (confirm || "").trim();
  if (!n && !c) {
    return { newPassword: current, confirmPassword: current, autofilled: true };
  }
  return { newPassword: next, confirmPassword: confirm, autofilled: false };
};

// 민감 키 마스킹(실제배포)
const redact = (obj) =>
  JSON.parse(JSON.stringify(obj, (k, v) =>
   ['currentPassword', 'newPassword', 'confirmPassword'].includes(k) ? '********' : v
 ));

//const redact = (obj) =>
// 깊은 복사만 하고 아무 키도 가리지 않음
// JSON.parse(JSON.stringify(obj));

const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
const onlyDigits = (v = "") => (v || "").replace(/\D/g, "");

const Profile = () => {
  // 지역
  const [sido, setSido] = useState('');
  const [gugun, setGugun] = useState('');

  // 폼 데이터
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');         // 현재 비밀번호
  const [newPassword, setNewPassword] = useState('');   // 새 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(''); // 새 비밀번호 확인
  const [nickname, setNickname] = useState('');
  const [birth, setBirth] = useState('');

  // 팝업
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);
  const closePopup = () => setIsCompletePopupOpen(false);

  // 중복확인 UI 상태
  const [emailLoading, setEmailLoading] = useState(false);
  const [nickLoading, setNickLoading] = useState(false);
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [emailCheckOk, setEmailCheckOk] = useState(null);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');
  const [nicknameCheckOk, setNicknameCheckOk] = useState(null);

  // 이메일 유효성
  const emailValid = isValidEmail(email);

  //중복확인 로직
  const [initialEmail, setInitialEmail] = useState('');
  const [initialNickname, setInitialNickname] = useState('');

  const [meLoaded, setMeLoaded] = useState(false);


  // 사용자 정보 가져오기
  useEffect(() => {
    const token = getToken();
    console.log('token:', token);
    debugJwt(token);

    fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const text = await res.text();
        console.log('status:', res.status, 'body:', text);
        if (!res.ok) throw new Error(text || '사용자 정보 불러오기 실패');
        return JSON.parse(text);
      })
      .then((data) => {
        // 응답이 { result: {...} } 또는 {...} 모두 지원
        const u = data?.result ?? data ?? {};
        console.log('[me normalized]', u);

        setEmail(u.email || '');
        setNickname(u.nickname || '');
        setBirth(formatBirthForInput(u.birth || '')); // 화면표시용 YYYY/MM/DD
        setSido(u.si || '');
        setGugun(u.gungu || u.gugun || '');

        setInitialEmail(u.email || '');
        setInitialNickname(u.nickname || '');

        setMeLoaded(true);
      })
      .catch((err) => console.error(err));
  }, []);

  // 변경 여부
  const emailChanged = email.trim() !== initialEmail;
  const nicknameChanged = nickname.trim() !== initialNickname;

  //중복확인 버튼 활성화 여부
  const canCheckEmail = emailChanged && emailValid && !emailLoading && emailCheckOk !== true;
  const canCheckNickname = nicknameChanged && !!nickname.trim() && !nickLoading && nicknameCheckOk !== true;

  // 완료 버튼 활성화 조건(서버 예시에 password 포함)
  const isCompleteEnabled =
    emailValid && password.trim() && nickname.trim() && birth.trim() && sido.trim() && gugun.trim()
    && (!emailChanged || emailCheckOk === true)
    && (!nicknameChanged || nicknameCheckOk === true);

  // RegionSelector 콜백
  const handleRegionChange = (arg1, type) => {
    if (typeof arg1 === 'object' && arg1 !== null) {
      setSido(arg1.sido || '');
      setGugun(arg1.gugun || '');
      return;
    }
    if (type === 'sido') {
      setSido(arg1 || '');
      setGugun('');
    } else if (type === 'gugun') {
      setGugun(arg1 || '');
    }
  };

  //이메일중복여부
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

      // 응답 구조: { code, message, result: { isAvailable: boolean } }
      const ok =
        (typeof data?.isAvailable === 'boolean' && data.isAvailable) ||
        (typeof data?.result?.isAvailable === 'boolean' && data.result.isAvailable) ||
        false;

      console.log('서버 응답:', data);
      console.log('parsed isAvailable:', ok);

      if (!res.ok) {
        const msg = data?.message || '이메일 중복확인에 실패했습니다.';
        setEmailCheckMsg(msg);
        setEmailCheckOk(false);
        alert(msg);
        return;
      }

      const msg = data?.message ?? (ok ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.');
      setEmailCheckOk(ok);     // 여기서 true로 세팅됨
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

  //닉네임중복확인
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

      const ok =
        (typeof data?.isAvailable === 'boolean' && data.isAvailable) ||
        (typeof data?.result?.isAvailable === 'boolean' && data.result.isAvailable) ||
        false;

      if (!res.ok) {
        const msg = data?.message || '닉네임 중복확인에 실패했습니다.';
        setNicknameCheckMsg(msg);
        setNicknameCheckOk(false);
        alert(msg);
        return;
      }

      const msg = data?.message ?? (ok ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.');
      setNicknameCheckOk(ok);  //  true/false 반영
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
  };


  //프로필 수정 완료
  const handleCompleteClick = async () => {
    if (!isCompleteEnabled) {
      return;
    }

    const birthForServer = formatBirthForServer(birth); // → 'YYYY-MM-DD' or null
    if (!birthForServer) {
      alert('생년월일 형식이 올바르지 않습니다. YYYY/MM/DD로 입력해주세요.');
      return;
    }

    if (emailChanged) {
      const ok = window.confirm(
        `이메일을 변경합니다.\n\n기존: ${initialEmail}\n새로운: ${email}\n\n계속하시겠습니까?`
      );
      if (!ok) return; // 사용자가 취소하면 제출 중단
    }

    // 새 비밀번호 검증(선택)
    const wantsPwChange = newPassword.trim() || confirmPassword.trim();
    if (wantsPwChange) {
      if (!newPassword.trim() || !confirmPassword.trim()) {
        alert('새 비밀번호와 새 비밀번호 확인을 모두 입력해주세요.');
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('새 비밀번호와 확인 값이 일치하지 않습니다.');
        return;
      }
      if (newPassword.length < 8) {
        alert('새 비밀번호는 8자 이상이어야 합니다.');
        return;
      }
    }

    const {
      newPassword: finalNewPassword,
      confirmPassword: finalConfirmPassword,
      autofilled,
    } = resolveNewPasswordFields(password, newPassword, confirmPassword);

    const token = getToken();

    const payload = {
      email,
      currentPassword: password,                 // 현재 비밀번호
      nickname,
      birth: birthForServer,    // YYYY-MM-DD
      si: sido,
      gungu: gugun,
      newPassword: finalNewPassword,
      confirmPassword: finalConfirmPassword,
    };

    // 요청 전 payload(마스킹됨) 확인
    console.groupCollapsed('[PUT /api/users/me] Request');
    console.log('payload', redact(payload));
    console.groupEnd();

    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { }

      console.groupCollapsed('[PUT /api/users/me] Response');
      console.log('status', res.status);
      console.log('data', data);
      console.groupEnd();

      if (!res.ok) {
        const msg = data?.message || '프로필 수정 실패';

        // 현재 비밀번호 불일치일 때만 알림창으로 처리 + 포커스 이동
        const isPwdMismatch =
          res.status === 400 || res.status === 401
            ? /현재 비밀번호|invalid password|password mismatch|비밀번호가 일치하지 않습니다/i.test(msg)
            : false;

        if (isPwdMismatch) {
          alert('현재 비밀번호가 일치하지 않습니다.');
          // Form 컴포넌트가 name에 'signup-' 접두어를 붙이므로 이 셀렉터가 맞음.
          document.querySelector('input[name="signup-currentPassword"]')?.focus();
          return;
        }

        alert(msg); // 그 외 에러
        return;
      }

      console.groupCollapsed('[PUT /api/users/me] ✓ Update OK');
      console.table({
        email: data?.email ?? email,
        nickname: data?.nickname ?? nickname,
        si: data?.si ?? sido,
        gungu: data?.gungu ?? gugun,
        birth: data?.birth ?? birthForServer,
      });
      console.groupEnd();

      setInitialEmail(data?.email ?? email);
      setInitialNickname(data?.nickname ?? nickname);
      setEmailCheckOk(null);
      setNicknameCheckOk(null);

      setIsCompletePopupOpen(true);
    } catch (err) {
      console.error(err);
      alert(err.message || '프로필 수정 실패');
    }
  };


  return (
    <div className="profile-wrap">
      <Menu />
      <Sidebar />

      <div className='profile'>
        <div className='profile-title'>Profile</div>
        <hr />
        {meLoaded ? (
          <div className='profile-form'>
            <div className='profile-labels'>
              <label>이메일</label>
              <label>현재 비밀번호</label>
              <label>새 비밀번호</label>
              <label>새 비밀번호 확인</label>
              <label>닉네임</label>
              <label>생년월일</label>
              <label>위치</label>
            </div>

            <div className='profile-inputs'>
              <Form
                type='email'
                name='email'
                placeholder='이메일'
                required
                value={email}
                onChange={(e) => {
                  const v = e.target.value;
                  console.log('[email onChange]', { prev: email, next: v });
                  setEmail(e.target.value);
                  setEmailCheckOk(null);          // 변경 시 초기화
                }}
              />

              {/* 현재 비밀번호: 필수만 체크 */}
              <Form
                type="password"
                name="currentPassword"        // 여기로 변경
                placeholder="현재 비밀번호"
                required
                showEye
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* 새 비밀번호: Form 내부 'password' 규칙 재사용 */}
              <Form
                type="password"
                name="password"               // 새 비밀번호만 password 이름 사용
                placeholder="새 비밀번호 (특수문자 포함, 8자 이상)"
                showEye
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                validateOnChange
              />

              {/* 새 비밀번호 확인: 불일치시 자동으로 안내문 뜸 */}
              <Form
                type="password"
                name="confirmPassword"
                placeholder="새 비밀번호 확인"
                showEye
                compareWith={newPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                validateOnChange
              />

              <Form
                type='text'
                name='nickname'
                placeholder='닉네임'
                required
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameCheckOk(null);       // 변경 시 초기화
                }}
              />

              <Form
                type="text"
                name="birth"
                placeholder="생년월일 (YYYY/MM/DD)"
                required
                value={birth}
                onChange={(e) => setBirth(formatBirthForInput(e.target.value))}
              />

              <RegionSelector
                key={`${sido}|${gugun}`}
                onRegionChange={handleRegionChange}
                initialSido={sido}
                initialGugun={gugun}
              />
            </div>

            <div className='profile-check-btn'>
              <div
                className="check-btn"
                onClick={canCheckEmail ? handleCheckEmail : undefined}
                role="button"
                aria-disabled={!canCheckEmail}
                style={{ cursor: canCheckEmail ? 'pointer' : 'not-allowed', background: canCheckEmail ? '#2C2C2C' : '#959595' }}
                aria-label="이메일 중복확인"
              >
                {emailChanged
                  ? (emailCheckOk === true ? '확인완료' : (emailLoading ? ' ' : '중복확인'))
                  : '중복확인'}
              </div>


              <div
                className="check-btn"
                onClick={canCheckNickname ? handleCheckNickname : undefined}
                role="button"
                aria-disabled={!canCheckNickname}
                style={{ cursor: canCheckNickname ? 'pointer' : 'not-allowed', background: canCheckNickname ? '#2C2C2C' : '#959595' }}
                aria-label="닉네임 중복확인"
              >
                {nicknameChanged
                  ? (nicknameCheckOk === true ? '확인완료' : (nickLoading ? ' ' : '중복확인'))
                  : '중복확인'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 16 }}>불러오는 중...</div>
        )}
        <div className='profile-setting-btn'>
          <button
            className={`profile-complete-btn ${isCompleteEnabled ? 'active' : 'disabled'}`}
            onClick={handleCompleteClick}
            disabled={!isCompleteEnabled}
          >
            완료
          </button>
        </div>
      </div>

      {isCompletePopupOpen && (
        <>
          <div className="profile-complete-popup-overlay" onClick={closePopup} />
          <div className="profile-complete-popup">
            <h2 className="profile-complete-popup-title">프로필 수정 완료</h2>
            <img src={Completeicon} alt="completeicon" className="profile-completeicon" />
            <button className="profile-complete-popup-close-btn" onClick={closePopup}>확인</button>
          </div>
        </>
      )}

      <div className="Profile-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
