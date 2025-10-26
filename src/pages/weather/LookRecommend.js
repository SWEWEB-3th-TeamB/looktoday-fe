import React, { useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

import Menu from '../../components/Menu';
import Footer from '../../components/Footer';

import lookRecommendData from './LookRecommendData';

import IconNone from '../../assets/images/WeatherIcon/IconNone.png';
import IconRain from '../../assets/images/WeatherIcon/IconRain.png';
import IconRainSnow from '../../assets/images/WeatherIcon/IconRainSnow.png';
import IconSnow from '../../assets/images/WeatherIcon/IconSnow.png';
import IconShower from '../../assets/images/WeatherIcon/IconShower.png';
import IconDrizzle from '../../assets/images/WeatherIcon/IconDrizzle.png';
import IconDrizzleSleet from '../../assets/images/WeatherIcon/IconDrizzleSleet.png';
import IconFlurries from '../../assets/images/WeatherIcon/IconFlurries.png';

import '../../styles/LookRecommend.css';

const WEATHER_ICON_MAP = {
  '강수 없음': { src: IconNone, alt: '강수 없음' },
  '비': { src: IconRain, alt: '비' },
  '비/눈': { src: IconRainSnow, alt: '비/눈' },
  '눈': { src: IconSnow, alt: '눈' },
  '소나기': { src: IconShower, alt: '소나기' },
  '빗방울': { src: IconDrizzle, alt: '빗방울' },
  '빗방울/눈날림': { src: IconDrizzleSleet, alt: '빗방울/눈날림' },
  '눈날림': { src: IconFlurries, alt: '눈날림' },
};

function getWeatherIconExact(label) {
  const key = typeof label === 'string' ? label.trim() : '';
  return WEATHER_ICON_MAP[key] || { src: IconNone, alt: '강수 없음' };
}

// 안전 숫자 변환
const toNum = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// "날씨" 문자열로 강수여부 추정 (소나기/비/눈 등)
const decideIsRainingByCondition = (cond) => {
  if (!cond) return false;
  const s = String(cond).toLowerCase();
  // 한·영 모두 대응 (원하면 더 추가)
  return /(비|소나기|강우|우박|눈)/i.test(s);
};

function LookRecommend() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 라우터 state 없을 때를 대비해 localStorage 백업 읽기
  const fromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem('lookPayload');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const src = state || fromStorage;

  // 직접 진입/데이터 없음 → 오늘날씨로 유도
  useEffect(() => {
    if (!src) navigate('/today-weather');
  }, [src, navigate]);

  // ==== 표시/분기에 쓰는 값들 ====
  const region        = src?.region ?? '지역 선택';
  const temperature   = toNum(src?.temperature, 24);
  const humidity      = toNum(src?.humidity, 60);
  const perceivedTemp = toNum(src?.perceivedTemp, temperature);
  const conditionStr  = src?.condition ?? ''; // "소나기" 등
  const { src: weatherIcon, alt: weatherAlt } = getWeatherIconExact(conditionStr);

  // 강수여부: 조건문자열로 추정
  const isRaining = decideIsRainingByCondition(conditionStr);

  // ===== 기존 분기 로직 유지 =====
  let bucket = '';
  if (isRaining) {
    bucket = temperature >= 10 ? 'HotRainy' : 'ColdRainy';
  } else {
    if (temperature >= 23) {
      bucket = humidity >= 70 ? 'HotAndHumid' : 'HotAndDry';
    } else if (temperature >= 15) {
      bucket = 'Mild';
    } else if (temperature >= 5) {
      bucket = 'Chilly';
    } else {
      bucket = 'Cold';
    }
  }

  const content = lookRecommendData[bucket];

  const getImagePath = (folder, filename) =>
    require(`../../assets/images/LookRecommendPhoto/${folder}/${filename}`);

  return (
    <div className='look-recommend-page'>
      <Menu />
      <h2 className='look-recommend-title'>LookRecommend</h2>

      <div className='look-recommend-contents'>
        <div className='look-recommend-contents-firstline'>
          <div className='look-recommend-weather-wrapper'>
            <p className='look-recommend-weather-title'>WAETHER</p>
            <div className='look-recommend-weather-card'>
              <img className='look-recommend-icon' src={weatherIcon} alt={weatherAlt} />
              <p className='look-recommend-temparature'>{temperature}°C</p>
              <p className='look-recommend-region'>{region}</p>
              <p className='look-recommend-humidityperceivedtemperature'>
                습도 {humidity}% 체감온도 {perceivedTemp} °C
              </p>
              <button
                className='look-recommend-region-select'
                onClick={() => navigate('/today-weather')}
              >
                다른 지역 선택하기
              </button>

              <div className='look-recommend-comment'>
                #{content?.comments?.[0]}<br />#{content?.comments?.[1]}
              </div>
            </div>
          </div>

          <div className='look-recommend-help'></div>

          <div className='look-recommend-outfit-wrapper'>
            <div className='look-recommend-outfit-title'>OUTFIT</div>
            <div className='look-recommend-outfit'>
              {content?.outfits?.map((img, idx) => (
                <img
                  key={idx}
                  className={`look-recommend-outfit${idx + 1}`}
                  src={getImagePath(bucket, img)}
                  alt={`outfit${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className='look-recommend-contents-secondline'>
          <div className='look-recommend-weatheritem-wrapper'>
            <div className='look-recommend-weatheritem-title'>WEATHER ITEM</div>
            <div className='look-recommend-weatheritem'>
              {content?.weatherItems?.map((img, idx) => (
                <img
                  key={idx}
                  className={`look-recommend-weatheritem${idx + 1}`}
                  src={getImagePath(bucket, img)}
                  alt={`weatheritem${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className='look-recommend-acc-wrapper'>
            <div className='look-recommend-acc-title'>ACC</div>
            <div className='look-recommend-acc'>
              {content?.accessories?.map((img, idx) => (
                <img
                  key={idx}
                  className={`look-recommend-acc${idx + 1}`}
                  src={getImagePath(bucket, img)}
                  alt={`acc${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LookRecommend;
