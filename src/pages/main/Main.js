import Menu from '../../components/Menu';
import Footer from '../../components/Footer';

import weatherRainy from '../../assets/images/MainPhoto/weather-rainy.png';
import weatherUmbrella from '../../assets/images/MainPhoto/weather-umbrella.png';
import recordSummer from '../../assets/images/MainPhoto/record-summer.png';
import recordAutumn from '../../assets/images/MainPhoto/record-autumn.png';
import recordWinter from '../../assets/images/MainPhoto/record-winter.png';
import styleLook from '../../assets/images/MainPhoto/style-look.png';
import communityBeach from '../../assets/images/MainPhoto/community-beach.png';
import communitySight from '../../assets/images/MainPhoto/community-sight.png';
import communityPerson from '../../assets/images/MainPhoto/community-person.png';

import '../../styles/Main.css';
import { useState, useEffect } from 'react';

const Login = () => {
  const today = new Date();
  const date = today.toISOString().split('T')[0];
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [token, setToken] = useState(null);
  const [hasWeather, setHasWeather] = useState(false);
  const [weatherError, setWeatherError] = useState('해당 지역의 최신 관측값이 없습니다.');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (storedToken) {
      handleWeather(storedToken);
    }
  }, []);

  const handleWeather = async (storedToken) => {
    try {
      const res = await fetch('/api/users/me/weather', {
        method: 'GET',
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (res.status === 404) {
        setHasWeather(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Server Error Response:', errorData);
        throw new Error('날씨 데이터를 불러오는데 실패했습니다.');
      }

      const data = await res.json();
      console.log('data', data);

      setLocation(`${data.result.region.시} ${data.result.region.군구}`);
      setWeather(data.result.data.summary.온도);
      setHasWeather(true)

    } catch (error) {
      console.error('error', error);
    }
  };

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
            {token ? (
              hasWeather ? (
                <div className='main-weather-info'>
                  {location} · <span>{weather}°C</span>
                </div>
              ) : weatherError ? (
                <div className='main-weather-info'>{weatherError}</div>
              ) : null
            ) : null}
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

        <section className='main-style'>
          <div className='main-style-background'></div>
          <div className='main-style-content'>
            <div className='main-style-title'>Find Your Style</div>
            <div className='main-style-text'>
              <span>LOOK BOOK에서 다양한 스타일을 구경하고</span>
              <span>나만의 개성을 찾아보세요.</span>
              <br />
              <span>데일리룩부터 특별한 날의 코디까지,</span>
              <span>새로운 스타일에 도전할 수 있습니다.</span>
              <br />
              <span>지역, 날씨, 날짜 필터로 오늘의 기온과</span>
              <span>분위기에 맞는 스타일을 빠르게 찾아보세요.</span>
              <br />
              <span>마음에 드는 룩북에는 좋아요를 눌러 취향을 기록하고,</span>
              <span>나만의 스타일 북을 완성해보세요.</span>
            </div>
            <div className='main-style-img'>
              <img src={styleLook} alt='style-look' className='main-style-look' />
            </div>
            <div className='main-style-bubble1' />
            <div className='main-style-bubble2' />
            <div className='main-style-block' />
          </div>
        </section>

        <section className='main-community'>
          <div className='main-community-content'>
            <div className="main-community-title">LOOK TODAY<br />LOOK TODAY<br />LOOK TODAY</div>
            <div className='main-community-text'>
              <span>지금 바로 회원가입하고 LOOK TODAY와 함께해요.</span>
              <br />
              <span>룩투데이는 당신의 일상을 스타일로 기록하고</span>
              <span>개성을 표현할 수 있도록 돕습니다.</span>
              <br />
              <span>매일의 룩이 특별한 이야기가</span>
              <span>되도록 함께하며,</span>
              <span>새로운 영감을 찾아보세요.</span>
            </div>
            <div className='main-community-join'>룩투데이에 감성을 더해봐요!</div>
            <div className='main-community-img'>
              <img src={communityBeach} alt='community-beach' className='main-community-beach' />
              <img src={communitySight} alt='community-sight' className='main-community-sight' />
              <img src={communityPerson} alt='community-person' className='main-community-person' />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
