// src/pages/TodayWeather.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import Menu from '../../components/Menu';
import SouthKoreaMap from '../../components/SouthKoreaMap';
import RegionSelector from '../../components/RegionSelector';
import Footer from '../../components/Footer';
import Weather from '../../assets/images/rainstorm.png';
import Sunrise from '../../assets/images/sunrise.png';
import Sunset from '../../assets/images/sunset.png';
import Humidity from '../../assets/images/humidity.png';
import Speed from '../../assets/images/speed.png';
import Chevronright from '../../assets/images/chevronright.png';

import '../../styles/TodayWeather.css';

const API_BASE = 'http://43.203.195.97:3000';

// API 호출 (백엔드 DB 조회)
function logHttpLine(url, res) {
  console.error(`GET ${url} ${res.status}${res.statusText ? ` (${res.statusText})` : ''}`)
}

// getWeather
async function getWeather(si, gungu) {
  if (!si || !gungu) throw new Error('getWeather: si/gungu는 필수입니다.');

  const qs = new URLSearchParams({ si, gungu });
  const url = `${API_BASE}/api/weather?${qs.toString()}`;

  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  const text = await res.text();

  // 🔎 디버깅: 서버 원문 응답을 콘솔에서 바로 확인
  console.log('[weather raw]', res.status, text);

  // 실패(status 4xx/5xx)
  if (!res.ok) {
    logHttpLine(url, res);
    throw new Error(`weather ${res.status}: ${text || res.statusText}`);
  }

  // 204/빈 응답을 명확히 기록
  if (res.status === 204 || text.trim() === '') {
    logHttpLine(url, res); // 예: GET ... 204 (No Content)
    throw new Error(`weather ${res.status}: empty response`);
  }

  // JSON 파싱 실패 기록
  try {
    return JSON.parse(text);
  } catch {
    logHttpLine(url, res); // 보통 200 (OK)
    throw new Error(`weather ${res.status}: invalid JSON`);
  }
}

// getSun
async function getSun(si, gungu) {
  if (!si || !gungu) throw new Error('getSun: si/gungu는 필수입니다.');

  const qs = new URLSearchParams({ si, gungu });
  const url = `${API_BASE}/api/sun?${qs.toString()}`;

  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  const text = await res.text();
  console.debug('[sun raw]', res.status, text);

  if (!res.ok) {
    // 네트워크 스타일 한 줄 로그만 찍고, statusText는 그대로 사용
    logHttpLine(url, res);
    throw new Error(`sun ${res.status}: ${text || res.statusText}`);
  }

  try { return text ? JSON.parse(text) : null; } catch { return null; }
}


//응답 판정 & 파서
function isWeatherSuccess(json) {
  if (!json || typeof json !== 'object') return false;
  if (json.success === true) return true;
  if (json.code === 'OK' || String(json.code).includes('200')) return true;

  // data가 없고 평평한(flat) 응답일 수도 있으니 핵심 필드가 있으면 성공으로 간주
  const base = json?.data ?? json;
  const hasCore =
    base?.온도 != null || base?.temp != null || base?.temperature != null ||
    base?.습도 != null || base?.humidity != null ||
    base?.풍속 != null || base?.wind != null || base?.windSpeed != null ||
    base?.기준시각 != null || base?.time != null || base?.observedAt != null;
  return !!hasCore;
}

function isSunSuccess(json) {
  if (!json || typeof json !== 'object') return false;
  if (json.success === true) return true;
  if (json.code === 'OK' || String(json.code).includes('200')) return true;

  const base = json?.data ?? json;
  const hasCore =
    base?.일출 != null || base?.sunrise != null ||
    base?.일몰 != null || base?.sunset != null;
  return !!hasCore;
}

const parseWeather = (json) => {
  const base = json?.data ?? json ?? {};

  const timeRaw =
    json?.기준시각?.시간 ??
    base?.기준시각?.시간 ??
    '';
  const day =
    json?.기준시각?.날짜 ??
    base?.기준시각?.날짜 ??
    '';

  const t = base?.온도 ?? base?.temp ?? base?.temperature;
  const h = base?.습도 ?? base?.humidity;
  const s = base?.풍속 ?? base?.wind ?? base?.windSpeed;

  const hhmm = typeof timeRaw === 'string' ? timeRaw.slice(0, 5) : '-';

  return {
    success: isWeatherSuccess(json),
    dateLabel: (hhmm !== '-' || day) ? `${hhmm} • ${day}` : '-',
    temperature: typeof t === 'number' ? Math.round(t) : (typeof t === 'string' ? t : '-'),
    humidity: (typeof h === 'number' || typeof h === 'string') ? h : '-',
    speed: (typeof s === 'number' || typeof s === 'string') ? s : '-',
  };
};

const parseSun = (json) => {
  const base = json?.data ?? json ?? {};
  const sr = base?.일출 ?? base?.sunrise ?? '-';
  const ss = base?.일몰 ?? base?.sunset ?? '-';
  return {
    success: isSunSuccess(json),
    sunrise: sr,
    sunset: ss
  };
};

const TodayWeather = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('typeof getWeather:', typeof getWeather); // "function"이어야 정상
  }, []);

  const [sido, setSido] = useState('서울특별시');
  const [gugun, setGugun] = useState('노원구');

  const [pending, setPending] = useState({ sido: '', gugun: '' }); // 버튼 누르기 전 임시 선택
  const [loading, setLoading] = useState(false);

  const [region, setRegion] = useState('서울특별시 노원구');
  const [date, setDate] = useState('-');
  const [temperature, setTemperature] = useState('-');
  const [sunrisetime, setSunrisetime] = useState('-');
  const [sunsettime, setSunsettime] = useState('-');
  const [humidity, setHumidity] = useState('-');
  const [speed, setSpeed] = useState('-');

  const regionTemperatures = {
    '서울특별시': 28, '부산광역시': 33, '대구광역시': 31, '인천광역시': 27,
    '광주광역시': 30, '대전광역시': 29, '울산광역시': 32, '경기도': 28,
    '강원도': 26, '충청북도': 29, '충청남도': 30, '전라북도': 30,
    '전라남도': 31, '경상북도': 31, '경상남도': 32, '제주특별자치도': 33,
    '세종특별자치시': 28
  };

  // RegionSelector에서 객체로 전달 받음
  const handleRegionChange = ({ sido, gugun }) => {
    setPending(prev => {
      // 시/도가 바뀌면 구/군을 초기화
      if (sido && sido !== prev.sido) {
        return { sido, gugun: "" };
      }
      // 구/군만 바뀌면 기존 시/도를 유지
      if (gugun) {
        return { ...prev, gugun };
      }
      return prev;
    });
  };

  // 공용 로더
  const loadWeather = async (si, gungu) => {
    setLoading(true);
    try {
      // 실패/성공을 개별적으로 받는다
      const [wRes, sRes] = await Promise.allSettled([
        getWeather(si, gungu),
        getSun(si, gungu),
      ]);

      const wJson = wRes.status === 'fulfilled' ? wRes.value : null;
      if (wRes.status === 'rejected') console.error('[weather fail]', wRes.reason);

      const sJson = sRes.status === 'fulfilled' ? sRes.value : null;
      if (sRes.status === 'rejected') console.error('[sun fail]', sRes.reason);

      const w = parseWeather(wJson);
      if (!w.success) console.warn('weather payload 비표준이거나 success=false:', wJson);

      const s = parseSun(sJson);
      if (!s.success) console.warn('sun payload 비표준이거나 success=false:', sJson);

      if (s.success) {
        console.log('일출/일몰', {
          message: '일출/일몰 값을 가져왔습니다.',
          region: { si, gungu },
          sunrise: s.sunrise,
          sunset: s.sunset,
        });
      }

      setDate(w.dateLabel || '-');
      setTemperature(w.temperature);
      setHumidity(w.humidity);
      setSpeed(w.speed);

      setSunrisetime(s.success ? s.sunrise : '-');
      setSunsettime(s.success ? s.sunset : '-');
    } catch (e) {
      console.error(e);
      setDate('-'); setTemperature('-'); setHumidity('-'); setSpeed('-');
      setSunrisetime('-'); setSunsettime('-');
    } finally {
      setLoading(false);
    }
  };


  // 초기 1회: 현재 sido/gugun으로 불러오기
  useEffect(() => {
    loadWeather(sido, gugun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 1회

  // 버튼 눌렀을 때만 지역 반영 & 재호출
  const applyRegion = async () => {
    if (!pending.sido || !pending.gugun) {
      alert('시/군구를 모두 선택하세요');
      return;
    }
    setSido(pending.sido);
    setGugun(pending.gugun);
    setRegion(`${pending.sido} ${pending.gugun}`);
    await loadWeather(pending.sido, pending.gugun);
  };

  //시간 변환 함수
  function to12Hour(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return '-';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    const period = h < 12 ? 'am' : 'pm';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')}${period}`;
  }


  return (
    <div className="today-weather-page">
      <Menu />
      <div className="weather-content">
        <h2 className="today-weather-page-title">How's the weather?</h2>
        <div className="today-weather-region-selector">
          <RegionSelector
            onRegionChange={handleRegionChange}
            initialSido="서울특별시"
            initialGugun="노원구"
          />
          <button
            className='today-weather-region-selector-button'
            onClick={applyRegion}
            disabled={!pending.sido || !pending.gugun || loading}
          >
            RegionSelector
          </button>
        </div>

        <SouthKoreaMap className="svg-map" selectedSido={sido} regionTemperatures={regionTemperatures} />

        <div className='today-weather-card-group'>
          <div className="today-weather-main-weather">
            <div className="today-weather-left">
              <p className="today-weather-region">{region}</p>
              <p className="today-weather-date">{date}</p>
              <p className="today-weather-temperature">{temperature}°C</p>
            </div>
            <div className="today-weather-right">
              <img className="today-weather-icon" src={Weather} alt="weather" />
            </div>
          </div>

          <div className="today-weather-sunrisesunset">
            <div className="today-weather-sunrisesunset-contents">
              <p className="today-weather-sunrisesunset-title">SUNRISE/SUNSET</p>
              <img className="today-weather-sunrise-icon" src={Sunrise} alt="sunrise" />
              <img className="today-weather-sunset-icon" src={Sunset} alt="sunset" />
              <p className="today-weather-sunrise">{to12Hour(sunrisetime)}</p>
              <p className="today-weather-sunset">{to12Hour(sunsettime)}</p>
            </div>
          </div>

          <div className="today-weather-humidity-card">
            <div className="today-weather-humidity-contents">
              <p className="today-weather-humidity-title">HUMIDITY</p>
              <img className="today-weather-humidity-icon" src={Humidity} alt="humidity" />
              <p className="today-weather-humidity">{humidity}%</p>
            </div>
          </div>

          <div className="today-weather-speed-card">
            <div className="today-weather-speed-contents">
              <p className="today-weather-speed-title">SPEED</p>
              <img className="today-weather-speed-icon" src={Speed} alt="speed" />
              <p className="today-weather-speed">{speed}m/s</p>
            </div>
          </div>
        </div>

        <button className="go-to-look-recommend" onClick={() => navigate("/lookrecommend")}>
          룩 추천 보러가기
          <img src={Chevronright} alt="chevronright" className="chevronright" />
        </button>
      </div>

      <div className='today-weather-footer'>
        <Footer />
      </div>
    </div>
  );
};

export default TodayWeather;
