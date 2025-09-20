import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import '../styles/Sidebar.css';

import myProfile from '../assets/images/my-profile.png';
import myFeed from '../assets/images/my-feed.png';
import myHeart from '../assets/images/my-heart.png';
import myLogout from '../assets/images/my-logout.png';

const menus = [
  { key: 'myfeed', name: '내 피드', icon: myFeed, boxTop: 81, imgTop: 95, textTop: 95 },
  { key: 'myheart', name: '내 좋아요', icon: myHeart, boxTop: 146, imgTop: 160, textTop: 160 },
  { key: 'profile', name: '프로필 설정', icon: myProfile, boxTop: 211, imgTop: 225, textTop: 225 },
  { key: 'logout', name: '로그아웃', icon: myLogout, boxTop: 276, imgTop: 291, textTop: 290 },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = React.useState(false);

  // 현재 경로에서 active key 파생
  const activeKey = React.useMemo(() => {
    const path = location.pathname.replace(/^\//, '');
    return path || 'myfeed';
  }, [location.pathname]);
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('user_email'); // 저장 안했다면 null이어도 괜찮음

    console.group('AUTH/LOGOUT (Sidebar)');
    console.log('로그아웃 시도', { userEmail, hasToken: !!token });

    try {
      console.time('logout_api');
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      console.timeEnd('logout_api');

      let body = {};
      try { body = await res.clone().json(); } catch {}

      console.log('응답 상태', res.status);
      console.log('응답 본문', body);

      if (res.ok) {
        console.log(` 로그아웃 성공: ${userEmail ?? 'unknown user'}`);
      } else {
        console.warn('로그아웃 응답이 OK가 아님');
      }
    } catch (err) {
      console.error('로그아웃 API 에러:', err);
    } finally {
      // 클라이언트 정리
      localStorage.removeItem('token');
      localStorage.removeItem('token_issued_at');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      console.log('localStorage 정리 완료');

      console.groupEnd();
      navigate('/', { replace: true }); // 메인으로
      setLoggingOut(false);
    }
  };

  const handleMenuClick = (key) => {
    if (key === 'logout') return handleLogout();
    navigate(`/${key}`);
  };

  return (
    <div className="sidebar-wrapper">
      {/*제목*/}
      <div className="sidebar-title">My Page</div>

      {/* 메뉴 박스 (활성 메뉴 위치로 이동) */}
      {menus.map(menu =>
        activeKey === menu.key ? (
          <div
            key={menu.key + '-box'}
            className="sidebar-menu-box"
            style={{ top: `${menu.boxTop}px`, left: '12px' }}
          />
        ) : null
      )}

      {/* 메뉴 아이템 */}
      {menus.map(menu => (
        <React.Fragment key={menu.key}>
          <img
            src={menu.icon}
            alt={menu.name}
            className="sidebar-menu-icon"
            style={{ top: `${menu.imgTop}px`, left: '29px' }}
            onClick={() => handleMenuClick(menu.key)}
          />
          <span
            className={`sidebar-menu-text${activeKey === menu.key ? ' selected' : ''}`}
            style={{ top: `${menu.textTop}px`, left: '70px' }}
            onClick={() => handleMenuClick(menu.key)}
          >
            {menu.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
