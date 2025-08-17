import { useState } from 'react';

import Menu from '../../components/Menu';
import RegionSelector from '../../components/RegionSelector';
import Footer from '../../components/Footer';
import Completeicon from '../../assets/images/complete.png';
import Sidebar from '../../components/Sidebar';
import Form from '../../components/Form';

import '../../styles/Profile.css';

const Profile = () => {
    const [selectedRegion, setSelectedRegion] = useState('');
    const [email, setEmail] = useState('LookToday@email.com');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('룩투데이');
    const [birth, setBirth] = useState('2002 / 02 / 02');
    const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);
    const isCompleteEnabled = email.trim() && password.trim() && username.trim() && birth.trim();

    const closePopup = () => {
        setIsCompletePopupOpen(false);
    };

    const handleCompleteClick = () => {
        if (!isCompleteEnabled) return; // 비활성 상태일 땐 작동 안 함
        setIsCompletePopupOpen(true);
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
                        <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
                        <Form type='password' placeholder='비밀번호 (특수문자 포함, 8자 이상)' showEye={true} />
                        <Form type="text" placeholder='닉네임' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <Form type="text" placeholder='생년월일 임시' value={birth} onChange={(e) => setBirth(e.target.value)} />
                        <RegionSelector onRegionChange={setSelectedRegion} />
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
            {/* 팝업 - isCompletePopupOpen true 일 때 화면 전체 옵셥 박스 + 중앙 팝업 */}
            {isCompletePopupOpen && (
                <>
                    <div className="profile-complete-popup-overlay" onClick={closePopup} />

                    <div className="profile-complete-popup">
                        <h2 className="profile-complete-popup-title">
                            프로필 수정 완료
                        </h2>
                        {/* 필요한 추가 내용, 버튼 등 넣어도 됨 */}
                        {/* 예: 팝업 닫기 버튼 */}
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
}

export default Profile;