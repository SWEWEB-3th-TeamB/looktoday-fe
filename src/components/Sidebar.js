import React from 'react';
import { useNavigate, useLocation} from 'react-router-dom';

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

  // 현재 경로에서 active key 파생
  const activeKey = React.useMemo(() => {
    const path = location.pathname.replace(/^\//, '');
    return path || 'myfeed';
  }, [location.pathname]);

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
            onClick={() => navigate(`/${menu.key}`)}
          />
          <span
            className={`sidebar-menu-text${activeKey === menu.key ? ' selected' : ''}`}
            style={{ top: `${menu.textTop}px`, left: '70px' }}
            onClick={() => navigate(`/${menu.key}`)}
          >
            {menu.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
