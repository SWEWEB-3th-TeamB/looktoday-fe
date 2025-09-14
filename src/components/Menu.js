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

  // 로그인 여부 상태
  const [isLogin, setIsLogin] = useState(false);

  // URL이 변경될 때마다 토큰을 체크해 로그인 상태 갱신
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('현재 토큰 값:', token); // 디버깅용
    setIsLogin(!!token); // token이 있으면 true, 없으면 false
  }, [location.pathname]);

  // 메뉴 클릭 시 active 상태 업데이트
  useEffect(() => {
    const path = location.pathname;

    if (path === '/today-weather') setActiveMenu('WEATHER');
    else if (path === '/looktoday') setActiveMenu('LOOKTODAY');
    else if (path === '/lookbook') setActiveMenu('LOOKBOOK');
    else if (['/profile', '/myfeed', '/myheart'].includes(path)) {
      setActiveMenu('MYPAGE');
    } else if (
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
