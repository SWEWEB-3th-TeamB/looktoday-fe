// src/pages/Profile.jsx
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

/** JWT payload를 콘솔에 찍어 확인 */
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

/** ---- 생년월일 포맷 유틸 ---- */
/** 서버값 → 입력표시값 (YYYY-MM-DD) */
const formatBirthForInput = (v) => {
  let val = (v ?? '').toString().trim();
  if (!val) return '';
  // ISO 8601: 'YYYY-MM-DD...' → 'YYYY/MM/DD'
  if (val.includes('T')) return val.slice(0, 10).replace(/-/g, '/');
};
/** 입력값 → 서버전송값 (YYYY-MM-DDT00:00:00.000Z) */
const formatBirthForServer = (val) => {
  if (!val) return '';
  const ymd = formatBirthForInput(val); // 우선 YYYY-MM-DD로 정규화
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return `${ymd}T00:00:00.000Z`;
  // 이미 ISO면 그대로
  if (ymd.includes('T')) return ymd;
  return ymd;
};

const Profile = () => {
  // 지역(시/군구) 상태
  const [sido, setSido] = useState('');
  const [gugun, setGugun] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // 현재 비밀번호로 사용
  const [username, setUsername] = useState('');
  const [birth, setBirth] = useState('');
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);

  const isCompleteEnabled = email.trim() && username.trim() && birth.trim() && sido.trim() && gugun.trim();

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
        setEmail(data.email || '');
        setUsername(data.nickname || '');     // 서버 스펙: nickname
        setBirth(formatBirthForInput(data.birth || ''));
        setSido(data.si || '');
        setGugun(data.gungu || data.gugun || '');
      })
      .catch((err) => console.error(err));
  }, []);

  // RegionSelector 콜백 (두 형태 모두 수용)
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

  const closePopup = () => setIsCompletePopupOpen(false);

  const handleCompleteClick = () => {
    if (!isCompleteEnabled) return;

    const token = getToken();

    fetch(`${API_BASE}/api/users/me`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        nickname: username,
        // 서버가 기대하는 형태로 변환해서 보냄
        birth: formatBirthForServer(birth),
        si: sido,
        gungu: gugun,
        password
      })
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(JSON.parse(text).message || '프로필 수정 실패');
        return JSON.parse(text);
      })
      .then((data) => {
        console.log('프로필 수정 완료:', data);
        setIsCompletePopupOpen(true);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="profile-wrap">
      <Menu />
      <Sidebar />

      <div className='profile'>
        <div className='profile-title'>Profile</div>
        <hr />
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
            <Form type="email" value={email} placeholder='이메일' onChange={(e) => setEmail(e.target.value)} />
            <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
            <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
            <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
            <Form type="text" placeholder='닉네임' value={username} onChange={(e) => setUsername(e.target.value)} />
            {/* 표시용은 YYYY-MM-DD */}
            <Form type="text" placeholder='생년월일 (YYYY-MM-DD)' value={birth} onChange={(e) => setBirth(formatBirthForInput(e.target.value))} />

            {/* 서버 값으로 초기 세팅 (리마운트 위해 key 사용) */}
            <RegionSelector
              key={`${sido}|${gugun}`}
              onRegionChange={handleRegionChange}
              initialSido={sido}
              initialGugun={gugun}
            />
          </div>
          <div className='profile-check-btn'>
            <div className='check-btn'>중복확인</div>
            <div className='check-btn'>중복확인</div>
          </div>
        </div>
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

      {/* 팝업 */}
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
