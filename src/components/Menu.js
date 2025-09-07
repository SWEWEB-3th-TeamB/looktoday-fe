import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Menu.css';

import logo from '../assets/images/logo.png';
import logoHover from '../assets/images/logo-hover.png';

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 메뉴 선택 시 active 반영
  useEffect(() => {
    const path = location.pathname;

    if (path === '/today-weather') setActiveMenu('WEATHER');
    else if (path === '/looktoday') setActiveMenu('LOOKTODAY');
    else if (path === '/lookbook') setActiveMenu('LOOKBOOK');
    else if (
      path === '/login' ||
      path === '/sign-up' ||
      path === '/sign-up-complete'
    ) {
      setActiveMenu('LOGIN');
    } else {
      setActiveMenu('');
    }
  }, [location.pathname]);

  return (
    <div className="menu">
      <div className="menu-gnb">
        {/* 로고 영역 */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => navigate('/')}
        >
          <img
            src={isHovered ? logoHover : logo}
            alt="logo"
            className={`logo-img ${isHovered ? 'hovered' : ''}`}
          />
        </div>

        {/* 메뉴 버튼 그룹 */}
        <div className="menu-group">
          <div
            onClick={() => {
              setActiveMenu('WEATHER');
              navigate('/today-weather');
            }}
            className={activeMenu === 'WEATHER' ? 'active-menu' : ''}
          >
            WEATHER
          </div>
          <div
            onClick={() => {
              setActiveMenu('LOOKTODAY');
              navigate('/looktoday');
            }}
            className={activeMenu === 'LOOKTODAY' ? 'active-menu' : ''}
          >
            LOOKTODAY
          </div>
          <div
            onClick={() => {
              setActiveMenu('LOOKBOOK');
              navigate('/lookbook');
            }}
            className={activeMenu === 'LOOKBOOK' ? 'active-menu' : ''}
          >
            LOOKBOOK
          </div>

          {/* 로그인 상태에 따라 메뉴 변경 */}
          {isLogin ? (
            <div
              onClick={() => {
                setActiveMenu('MYPAGE');
                navigate('/profile');
              }}
              className={activeMenu === 'MYPAGE' ? 'active-menu' : ''}
            >
              MY PAGE
            </div>
          ) : (
            <div
              onClick={() => {
                setActiveMenu('LOGIN');
                navigate('/login');
              }}
              className={activeMenu === 'LOGIN' ? 'active-menu' : ''}
            >
              LOGIN
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
