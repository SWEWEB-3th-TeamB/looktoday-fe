import React from 'react';
import Menu from '../../components/Menu';

import weatherRainy from '../../assets/images/MainPhoto/weather-rainy.png';
import weatherUmbrella from '../../assets/images/MainPhoto/weather-umbrella.png';
import recordSummer from '../../assets/images/MainPhoto/record-summer.png';
import recordAutumn from '../../assets/images/MainPhoto/record-autumn.png';
import recordWinter from '../../assets/images/MainPhoto/record-winter.png';

import '../../styles/Main.css';

const Login = () => {
  const today = new Date();
  const date = today.toISOString().split('T')[0];

  return (
    <div>
      <Menu />
      <div className='main'>
        <section className='main-weather'>
          <div className='main-weather-background'></div>
          <div className='main-weather-content'>
            <div className="main-weather-title">
              <span>How's the <strong>weather</strong>?</span>
            </div>
            <div className='main-weather-info'>
              서울특별시 노원구 · <span>24°C</span>
            </div>
            <div className='main-weather-date'>{date}</div>

            <div className='main-weather-text'>
              <span>WEATHER에서 원하는 위치를 선택하고</span>
              <span>현재 기온, 습도, 바람 세기, 일출·일몰 시간까지</span>
              <span>한눈에 확인해보세요.</span>
              <br />
              <span>룩 추천을 통해 오늘의 날씨에 맞는</span>
              <span>아이템을 살펴보고, 온도와 습도에 어울리는</span>
              <span>스타일로 코디를 완성해보세요.</span>
            </div>

            <img
              src={weatherRainy}
              alt='weather-rainy'
              className='main-weather-rainy'
            />
            <img
              src={weatherUmbrella}
              alt='weather-umbrella'
              className='main-weather-umbrella'
            />
          </div>
        </section>

        <section className='main-record'>
          <div className='main-record-background'></div>
          <div className='main-record-content'>
            <div className="main-record-title">Record My Look</div>
            <div className='main-record-text'>
              <span>LOOK TODAY에서 계절에 상관없이 오늘의 룩을 기록해보세요.</span>
              <span>체감 온도와 습도, 위치와 시간을 입력해 오늘의 상황을 남길 수 있습니다.</span>
              <span>사진과 한 줄 평가로 나만의 스타일을 간편하게 저장해보세요.</span>
            </div>
            <div className='main-record-img'>
              <img src={recordSummer} alt='record-summer' className='main-record-summer' />
              <img src={recordAutumn} alt='record-autumn' className='main-record-autumn' />
              <img src={recordWinter} alt='record-winter' className='main-record-winter' />
            </div>
            <div className='main-record-bubble1' />
            <div className='main-record-bubble2' />
          </div>
        </section>

        <section className='main-style'></section>
        <section className='main-community'></section>
      </div>
    </div>
  );
};

export default Login;
