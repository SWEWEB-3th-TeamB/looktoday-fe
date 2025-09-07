import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Menu.css';

import logo from '../assets/images/logo.png';
import logoHover from '../assets/images/logo-hover.png';

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // 로그인 상태 관리

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLogin(!!token);
    };

    checkLoginStatus();

    window.addEventListener('authChanged', checkLoginStatus);

    const handleStorage = (e) => {
      if (e.key === 'token') {
        checkLoginStatus();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('authChanged', checkLoginStatus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;

    if (path === '/todayWeather') setActiveMenu('WEATHER');
    else if (path === '/looktoday') setActiveMenu('LOOKTODAY');
    else if (path === '/lookbook') setActiveMenu('LOOKBOOK');
    else if (['/login', '/sign-up', '/sign-up-complete'].includes(path))
      setActiveMenu('LOGIN');
    else if (['/profile', '/myfeed', '/myheart'].some((p) => path.startsWith(p)))
      setActiveMenu('MYPAGE');
    else setActiveMenu('');
  }, [location.pathname]);

  return (
    <div className='menu'>
      <div className='menu-gnb'>
        {/* 로고 */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => navigate('/')}
        >
          <img
            src={isHovered ? logoHover : logo}
            alt='logo'
            className={`logo-img ${isHovered ? 'hovered' : ''}`}
          />
        </div>

        {/* 메뉴 그룹 */}
        <div className='menu-group'>
          <div
            onClick={() => {
              setActiveMenu('WEATHER');
              navigate('/TodayWeather');
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
            LOOK TODAY
          </div>

          <div
            onClick={() => {
              setActiveMenu('LOOKBOOK');
              navigate('/lookbook');
            }}
            className={activeMenu === 'LOOKBOOK' ? 'active-menu' : ''}
          >
            LOOK BOOK
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
