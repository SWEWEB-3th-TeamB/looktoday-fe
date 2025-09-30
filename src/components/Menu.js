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

  // 로그인 여부
  const [isLogin, setIsLogin] = useState(false);

  // 24시간 만료 (ms)
  const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000;

  // 개발 모드에서 앱 시작 시 localStorage 초기화
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const hasCleared = sessionStorage.getItem('clearedLocalStorage');

      if (!hasCleared) {
        console.log('💻 개발 모드 첫 실행 → localStorage 초기화');
        localStorage.clear();
        sessionStorage.setItem('clearedLocalStorage', 'true');
      } else {
        console.log('💻 개발 모드 → localStorage 유지');
      }
    }
  }, []);

  // 토큰 및 만료 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenIssuedAt = localStorage.getItem('token_issued_at'); // 토큰 발급 시간

    console.log('📍 현재 localStorage token:', token);
    console.log('📍 현재 localStorage tokenIssuedAt:', tokenIssuedAt);

    // 1) 토큰 없으면 로그인 상태 false
    if (!token) {
      console.log('❌ 토큰 없음 → 로그인 상태 false');
      setIsLogin(false);
      return;
    }

    if (!tokenIssuedAt) {
      console.log('❌ token_issued_at 없음 → 로그인 상태 false');
      setIsLogin(false);
      return;
    }

    const now = Date.now();
    const issuedTime = parseInt(tokenIssuedAt, 10);

    // 2) 토큰 만료 체크
    if (now - issuedTime > TOKEN_EXPIRY_TIME) {
      console.log('⏰ 토큰 만료됨 → 자동 로그아웃 처리');
      localStorage.removeItem('token');
      localStorage.removeItem('token_issued_at');
      setIsLogin(false);
      alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }

    // 3) 유효한 토큰 → 로그인 유지
    console.log('✅ 토큰 유효 → 로그인 상태 true');
    setIsLogin(true);
  }, [location.pathname, navigate]);

  // 메뉴 활성화 상태 업데이트
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
      path ==='/verification' ||
      path ==='/change-password' ||
      path ==='/change-password-complete'
    ) {
      setActiveMenu('LOGIN');
    } else {
      setActiveMenu('');
    }
  }, [location.pathname]);

  return (
    // ✅ 메인 페이지('/')일 때만 menu-main 클래스가 추가됨
    <div className={`menu ${location.pathname === '/' ? 'menu-main' : ''}`}>
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
          {/* WEATHER */}
          <div
            onClick={() => {
              setActiveMenu('WEATHER');
              navigate('/today-weather');
            }}
            className={activeMenu === 'WEATHER' ? 'active-menu' : ''}
          >
            WEATHER
          </div>

          {/* LOOK TODAY */}
          <div
            onClick={() => {
              if (!isLogin) {
                alert('로그인 후 이용 가능합니다.');
                return;
              }
              setActiveMenu('LOOKTODAY');
              navigate('/looktoday');
            }}
            className={activeMenu === 'LOOKTODAY' ? 'active-menu' : ''}
          >
            LOOK TODAY
          </div>

          {/* LOOK BOOK */}
          <div
            onClick={() => {
              if (!isLogin) {
                alert('로그인 후 이용 가능합니다.');
                return;
              }
              setActiveMenu('LOOKBOOK');
              navigate('/lookbook');
            }}
            className={activeMenu === 'LOOKBOOK' ? 'active-menu' : ''}
          >
            LOOK BOOK
          </div>

          {/* LOGIN / MY PAGE */}
          {isLogin ? (
            <div
              onClick={() => {
                setActiveMenu('MYPAGE');
                navigate('/myfeed');
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