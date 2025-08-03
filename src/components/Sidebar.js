// src/components/Sidebar.js
import React, { useState } from 'react';
import '../styles/Sidebar.css';

import myProfile from '../assets/images/my-profile.png';
import myFeed from '../assets/images/my-feed.png';
import myHeart from '../assets/images/my-heart.png';
import myLogout from '../assets/images/my-logout.png';

const menus = [
  {
    key: 'profile',
    name: '프로필 설정',
    icon: myProfile,
    boxTop: 78,
    imgTop: 95,
    textTop: 95,
  },
  {
    key: 'feed',
    name: '내 피드',
    icon: myFeed,
    boxTop: 143,
    imgTop: 160,
    textTop: 160,
  },
  {
    key: 'heart',
    name: '내 좋아요',
    icon: myHeart,
    boxTop: 208,
    imgTop: 225,
    textTop: 225,
  },
  {
    key: 'logout',
    name: '로그아웃',
    icon: myLogout,
    boxTop: 273,
    imgTop: 291,
    textTop: 290,
  },
];

export default function Sidebar() {
  // default 메뉴는 '내 피드'
  const [selected, setSelected] = useState('feed');

  return (
    <div className="sidebar-wrapper">
      {/* 제목 */}
      <div className="sidebar-title">My Page</div>

      {/* 메뉴 박스 */}
      {menus.map((menu) =>
        selected === menu.key ? (
          <div
            className="sidebar-menu-box"
            style={{ top: `${menu.boxTop}px`, left: '12px' }}
            key={menu.key + '-box'}
          />
        ) : null
      )}

      {/* 메뉴 아이템 */}
      {menus.map((menu) => (
        <React.Fragment key={menu.key}>
          <img
            src={menu.icon}
            alt={menu.name}
            className="sidebar-menu-icon"
            style={{ top: `${menu.imgTop}px`, left: "29px" }}
            onClick={() => setSelected(menu.key)}
          />
          <span
            className={`sidebar-menu-text${selected === menu.key ? ' selected' : ''}`}
            style={{ top: `${menu.textTop}px`, left: "70px" }}
            onClick={() => setSelected(menu.key)}
          >
            {menu.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
