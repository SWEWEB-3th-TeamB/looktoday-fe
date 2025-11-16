import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Menu.css';

import logo from '../assets/images/logo.png';
import logoHover from '../assets/images/logo-hover.png';
import menuIcon from '../assets/images/menu.png';

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const hasCleared = sessionStorage.getItem('clearedLocalStorage');

      if (!hasCleared) {
        localStorage.clear();
        sessionStorage.setItem('clearedLocalStorage', 'true');
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenIssuedAt = localStorage.getItem('token_issued_at');

    if (!token || !tokenIssuedAt) {
      setIsLogin(false);
      return;
    }

    const now = Date.now();
    const issuedTime = parseInt(tokenIssuedAt, 10);

    if (now - issuedTime > TOKEN_EXPIRY_TIME) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_issued_at');
      setIsLogin(false);
      alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    setIsLogin(true);
  }, [location.pathname, navigate]);

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
      path === '/sign-up-complete' ||
      path === '/verification' ||
      path === '/change-password' ||
      path === '/change-password-complete'
    ) {
      setActiveMenu('LOGIN');
    } else if (path === '/') {
      setActiveMenu('HOME');
    } else {
      setActiveMenu('');
    }
  }, [location.pathname]);

  const handleNavigate = (key, path, needLogin = false) => {
    if (needLogin && !isLogin) {
      alert('로그인 후 이용 가능합니다.');
      setIsMobileMenuOpen(false);
      navigate('/login');
      return;
    }
    setActiveMenu(key);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className={`menu ${location.pathname === '/' ? 'menu-main' : ''}`}>
      <div className="menu-gnb">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => handleNavigate('HOME', '/')}
        >
          <img
            src={isHovered ? logoHover : logo}
            alt="logo"
            className={`logo-img ${isHovered ? 'hovered' : ''}`}
          />
        </div>

        <div className="menu-group">
          <div
            onClick={() => handleNavigate('WEATHER', '/today-weather')}
            className={activeMenu === 'WEATHER' ? 'active-menu' : ''}
          >
            WEATHER
          </div>

          <div
            onClick={() => handleNavigate('LOOKTODAY', '/looktoday', true)}
            className={activeMenu === 'LOOKTODAY' ? 'active-menu' : ''}
          >
            LOOK TODAY
          </div>

          <div
            onClick={() => handleNavigate('LOOKBOOK', '/lookbook', true)}
            className={activeMenu === 'LOOKBOOK' ? 'active-menu' : ''}
          >
            LOOK BOOK
          </div>

          {isLogin ? (
            <div
              onClick={() => handleNavigate('MYPAGE', '/myfeed')}
              className={activeMenu === 'MYPAGE' ? 'active-menu' : ''}
            >
              MY PAGE
            </div>
          ) : (
            <div
              onClick={() => handleNavigate('LOGIN', '/login')}
              className={activeMenu === 'LOGIN' ? 'active-menu' : ''}
            >
              LOGIN
            </div>
          )}
        </div>

        <div className="menu-icon-wrap" onClick={() => setIsMobileMenuOpen(true)}>
          <img
            src={menuIcon}
            alt="menu"
            className="menu-icon"
          />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-menu-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <img src={logo} alt="logo" className="mobile-menu-logo" />
            </div>
            <div className="mobile-menu-list">
              <div
                className={`mobile-menu-item ${
                  location.pathname === '/' ? 'active' : ''
                }`}
                onClick={() => handleNavigate('HOME', '/')}
              >
                HOME
              </div>
              <div
                className={`mobile-menu-item ${
                  activeMenu === 'WEATHER' ? 'active' : ''
                }`}
                onClick={() => handleNavigate('WEATHER', '/today-weather')}
              >
                WEATHER
              </div>
              <div
                className={`mobile-menu-item ${
                  activeMenu === 'LOOKTODAY' ? 'active' : ''
                }`}
                onClick={() => handleNavigate('LOOKTODAY', '/looktoday', true)}
              >
                LOOK TODAY
              </div>
              <div
                className={`mobile-menu-item ${
                  activeMenu === 'LOOKBOOK' ? 'active' : ''
                }`}
                onClick={() => handleNavigate('LOOKBOOK', '/lookbook', true)}
              >
                LOOK BOOK
              </div>
              <div
                className={`mobile-menu-item ${
                  activeMenu === 'MYPAGE' || activeMenu === 'LOGIN'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  isLogin
                    ? handleNavigate('MYPAGE', '/myfeed')
                    : handleNavigate('LOGIN', '/login')
                }
              >
                {isLogin ? 'MY PAGE' : 'LOGIN'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;