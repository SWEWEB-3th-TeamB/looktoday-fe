import React from 'react';
import Menu from '../../components/Menu';

import weatherRainy from '../../assets/images/MainPhoto/weather-rainy.png';
import weatherUmbrella from '../../assets/images/MainPhoto/weather-umbrella.png';

import '../../styles/Main.css';

const Login = () => {
  return (
    <div>
      <Menu />
      <div className='main'>
        <div className='main-weather-background'></div>
        <div className='main-weather'>
          <div className="main-weather-title">
            <span>How's the <strong>weather</strong>?</span>
          </div>
          <div className='main-weather-info'>서울특별시 노원구 · <span>24°C</span></div>
          <div className='main-weather-date'>2025-09-15</div>
          <div className='main-weather-text'>
            <span>WEATHER에서 원하는 위치를 선택하고</span>
            <span>현재 기온, 습도, 바람 세기, 일출·일몰 시간까지</span>
            <span>한눈에 확인해보세요.</span><br />
            <span>룩 추천을 통해 오늘의 날씨에 맞는</span>
            <span>아이템을 살펴보고, 온도와 습도에 어울리는</span>
            <span>스타일로 코디를 완성해보세요.</span>
          </div>
          <img src={weatherRainy} alt='weather-rainy' className='main-weather-rainy' />
          <img src={weatherUmbrella} alt='weather-umbrella' className='main-weather-umbrella' />
        </div>
        <div className='main-record'></div>
        <div className='main-style'></div>
        <div className='main-community'></div>
      </div>
    </div>
  );
};

export default Login;
