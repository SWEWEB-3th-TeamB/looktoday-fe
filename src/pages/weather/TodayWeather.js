import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import Menu from '../../components/Menu';
import SouthKoreaMap from '../../components/SouthKoreaMap';
import RegionSelector from '../../components/RegionSelector';
import Footer from '../../components/Footer';
import Sunrise from '../../assets/images/sunrise.png';
import Sunset from '../../assets/images/sunset.png';
import Humidity from '../../assets/images/humidity.png';
import Speed from '../../assets/images/speed.png';
import Chevronright from '../../assets/images/chevronright.png';

import IconNone from '../../assets/images/WeatherIcon/IconNone.png';
import IconRain from '../../assets/images/WeatherIcon/IconRain.png';
import IconRainSnow from '../../assets/images/WeatherIcon/IconRainSnow.png';
import IconSnow from '../../assets/images/WeatherIcon/IconSnow.png';
import IconShower from '../../assets/images/WeatherIcon/IconShower.png';
import IconDrizzle from '../../assets/images/WeatherIcon/IconDrizzle.png';
import IconDrizzleSleet from '../../assets/images/WeatherIcon/IconDrizzleSleet.png';
import IconFlurries from '../../assets/images/WeatherIcon/IconFlurries.png';

import '../../styles/TodayWeather.css';

/* ========================
   ✅ 지역명 정규화 유틸
   ======================== */
const SIDO_MAP = {
  '서울': '서울특별시',
  '부산': '부산광역시',
  '대구': '대구광역시',
  '인천': '인천광역시',
  '광주': '광주광역시',
  '대전': '대전광역시',
  '울산': '울산광역시',
  '세종': '세종특별자치시',
  '경기': '경기도',
  '강원': '강원도',
  '충북': '충청북도',
  '충남': '충청남도',
  '전북': '전라북도',
  '전남': '전라남도',
  '경북': '경상북도',
  '경남': '경상남도',
  '제주': '제주특별자치도',
};

function normalizeSi(si) {
  if (!si) return si;
  // 이미 정식 접미사가 있으면 그대로
  if (/(특별시|광역시|특별자치시|도)$/.test(si)) return si;
  return SIDO_MAP[si] || si;
}

function normalizeGungu(gungu) {
  if (!gungu) return gungu;
  // 이미 접미사가 있으면 그대로
  if (/(구|군|시)$/.test(gungu)) return gungu;
  // 가장 흔한 축약형(강남, 노원 등) -> 구
  return `${gungu}구`;
}

function normalizeRegion(si, gungu) {
  return { si: normalizeSi(si), gungu: normalizeGungu(gungu) };
}

/* ======================== */

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

// API 호출 (백엔드 DB 조회)
function logHttpLine(url, res) {
  console.error(`GET ${url} ${res.status}${res.statusText ? ` (${res.statusText})` : ''}`)
}

function getAuthToken() {
  try { return localStorage.getItem('token'); } catch { return null; }
}

async function getMyWeather() {
  const token = localStorage.getItem('token');
  console.log('[getMyWeather] token?', !!token);

  if (!token) return null;

  const url = '/api/users/me/weather';
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  console.log('[getMyWeather] status:', res.status, res.statusText);
  console.log('[getMyWeather] raw:', text);

  if (res.status === 400) {
    let body; try { body = JSON.parse(text); } catch { body = { message: text }; }
    console.warn('[getMyWeather] 400 body:', body);
    return { __error__: 'NO_REGION', body };
  }
  if (res.status === 401 || res.status === 403) {
    console.warn('[getMyWeather] auth error', res.status);
    return null;
  }
  if (!res.ok) {
    console.warn('[getMyWeather] !ok -> null');
    return null;
  }

  try {
    const json = JSON.parse(text);

    // 응답 정규화
    if (json && typeof json === 'object') {
      const resultNode = json.result ?? json.data ?? json;
      const region = resultNode.region || {};
      const normalizedRegion = {
        시: region.시 ?? region.sido ?? region.si ?? null,
        군구: region.군구 ?? region.gungu ?? region.gu ?? null,
        sido: region.sido ?? region.시 ?? region.si ?? null,
        gungu: region.gungu ?? region.군구 ?? region.gu ?? null,
      };

      const normalized = {
        code: json.code ?? 'OK',
        message: json.message ?? '',
        result: {
          ...(resultNode || {}),
          region: normalizedRegion,
        },
      };

      console.log('[getMyWeather] parsed(normalized):', normalized);
      return normalized;
    }

    console.log('[getMyWeather] parsed:', json);
    return json;
  } catch (e) {
    console.warn('[getMyWeather] JSON parse fail', e);
    return null;
  }
}


// getWeather
async function getWeather(si, gungu) {
  if (!si || !gungu) throw new Error('getWeather: si/gungu는 필수입니다.');
  // ✅ 호출 직전에 정규화
  ({ si, gungu } = normalizeRegion(si, gungu));

  const qs = new URLSearchParams({ si, gungu });
  const url = `/api/weather?${qs.toString()}`;

  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  const text = await res.text();

  // 디버깅: 서버 원문 응답
  console.log('[weather raw]', res.status, text);

  if (!res.ok) {
    logHttpLine(url, res);
    throw new Error(`weather ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204 || text.trim() === '') {
    logHttpLine(url, res);
    throw new Error(`weather ${res.status}: empty response`);
  }

  try {
    return JSON.parse(text);
  } catch {
    logHttpLine(url, res);
    throw new Error(`weather ${res.status}: invalid JSON`);
  }
}


async function getSun(si, gungu) {
  if (!si || !gungu) throw new Error('getSun: si/gungu는 필수입니다.');
  ({ si, gungu } = normalizeRegion(si, gungu));

  const qs = new URLSearchParams({ si, gungu });
  const url = `/api/sun?${qs.toString()}`;

  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  const text = await res.text();
  console.debug('[sun raw]', res.status, text);

  if (!res.ok) {
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

  const base = json?.data ?? json;
  const hasCore =
    base?.날씨 != null ||
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
  const dataNode = json?.data ?? json ?? {};
  const base = dataNode?.summary ?? dataNode;

  const timeRaw =
    json?.기준시각?.시간 ??
    dataNode?.기준시각?.시간 ??
    '';
  const day =
    json?.기준시각?.날짜 ??
    dataNode?.기준시각?.날짜 ??
    '';

  const t = base?.온도 ?? base?.temp ?? base?.temperature;
  const h = base?.습도 ?? base?.humidity;
  const s = base?.풍속 ?? base?.wind ?? base?.windSpeed;

  const feels = base?.체감온도 ?? base?.feels_like ?? base?.apparentTemperature;
  const cond = base?.날씨 ?? base?.weather ?? base?.condition ?? base?.sky;
  const pop = base?.강수확률 ?? base?.POP ?? base?.pop;
  const pcp = base?.강수량 ?? base?.PCP ?? base?.pcp ?? base?.precipitation;

  const hhmm = typeof timeRaw === 'string' ? timeRaw.slice(0, 5) : '-';

  return {
    success: isWeatherSuccess(json),
    dateLabel: (hhmm !== '-' || day) ? `${hhmm} • ${day}` : '-',
    temperature: typeof t === 'number' ? Math.round(t) : (typeof t === 'string' ? t : '-'),
    humidity: (typeof h === 'number' || typeof h === 'string') ? h : '-',
    speed: (typeof s === 'number' || typeof s === 'string') ? s : '-',
    condition: typeof cond === 'string' ? cond : '-',
    perceived: typeof feels === 'number' ? Math.round(feels) : feels ?? '-',
    pop, pcp,
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
    console.log('typeof getWeather:', typeof getWeather);
  }, []);

  const [sido, setSido] = useState('서울특별시');
  const [gugun, setGugun] = useState('노원구');

  const [pending, setPending] = useState({ sido: '서울특별시', gugun: '노원구' });
  const [loading, setLoading] = useState(false);

  const [region, setRegion] = useState('서울특별시 노원구');
  const [date, setDate] = useState('-');
  const [temperature, setTemperature] = useState('-');
  const [sunrisetime, setSunrisetime] = useState('-');
  const [sunsettime, setSunsettime] = useState('-');
  const [humidity, setHumidity] = useState('-');
  const [speed, setSpeed] = useState('-');
  const [condition, setCondition] = useState('-');
  const [perceivedTemp, setPerceivedTemp] = useState('-');

  const regionTemperatures = {
    '서울특별시': 28, '부산광역시': 33, '대구광역시': 31, '인천광역시': 27,
    '광주광역시': 30, '대전광역시': 29, '울산광역시': 32, '경기도': 28,
    '강원도': 26, '충청북도': 29, '충청남도': 30, '전라북도': 30,
    '전라남도': 31, '경상북도': 31, '경상남도': 32, '제주특별자치도': 33,
    '세종특별자치시': 28
  };

  const handleRegionChange = ({ sido, gugun }) => {
    setPending(prev => {
      if (sido && sido !== prev.sido) {
        return { sido, gugun: "" };
      }
      if (gugun) {
        return { ...prev, gugun };
      }
      return prev;
    });
  };

  const loadMyWeather = async () => {
    console.log('[loadMyWeather] start');
    setLoading(true);
    try {
      const meJson = await getMyWeather();
      console.log('[loadMyWeather] meJson:', meJson);

      if (!meJson) throw new Error('no me weather');

      if (meJson.__error__ === 'NO_REGION') {
        console.warn('[loadMyWeather] NO_REGION -> fallback');
        await loadWeather(sido, gugun, { withSpinner: false });
        return;
      }

      const wPayload = meJson?.result ?? meJson ?? {};
      const dataNode = wPayload?.data ?? wPayload ?? {};
      const core = dataNode?.summary ?? dataNode;

      const rawSi = wPayload?.region?.시 ?? wPayload?.region?.sido ?? sido;
      const rawGungu = wPayload?.region?.군구 ?? wPayload?.region?.gungu ?? gugun;
      const { si, gungu } = normalizeRegion(rawSi, rawGungu);
      console.log('[loadMyWeather] region from profile:', { si, gungu });

      const timeRaw = wPayload?.기준시각?.시간 ?? dataNode?.기준시각?.시간 ?? '';
      const day = wPayload?.기준시각?.날짜 ?? dataNode?.기준시각?.날짜 ?? '';
      const tempVal = core?.온도 ?? core?.temp ?? core?.temperature;
      const humidVal = core?.습도 ?? core?.humidity;
      const speedVal = core?.풍속 ?? core?.wind ?? core?.windSpeed;
      const feelsVal = core?.체감온도 ?? core?.feels_like ?? core?.apparentTemperature;
      const condVal = core?.날씨 ?? core?.weather ?? core?.condition ?? core?.sky;

      const hhmm = typeof timeRaw === 'string' ? timeRaw.slice(0, 5) : '-';
      const dateLabel = (hhmm !== '-' || day) ? `${hhmm} • ${day}` : '-';

      const sJson = await getSun(si, gungu);
      console.log('[loadMyWeather] sun raw:', sJson);
      const sun = parseSun(sJson);

      setSido(si);setGugun(gungu);setRegion(`${si} ${gungu}`);
      setDate(dateLabel || '-');
      setTemperature(typeof tempVal === 'number' ? Math.round(tempVal) : (typeof tempVal === 'string' ? tempVal : '-'));
      setHumidity((typeof humidVal === 'number' || typeof humidVal === 'string') ? humidVal : '-');
      setSpeed((typeof speedVal === 'number' || typeof speedVal === 'string') ? speedVal : '-');
      setCondition(typeof condVal === 'string' ? condVal : '-');
      setPerceivedTemp(typeof feelsVal === 'number' ? Math.round(feelsVal) : (feelsVal ?? '-'));
      setSunrisetime(sun.success ? sun.sunrise : '-');
      setSunsettime(sun.success ? sun.sunset : '-');

      console.log('[loadMyWeather] done');
    } catch (e) {
      console.warn('[loadMyWeather] error -> fallback', e);
      await loadWeather(sido, gugun, { withSpinner: false });
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = async (si, gungu) => {
    setLoading(true);
    try {
      const [wRes, sRes] = await Promise.allSettled([
        getWeather(si, gungu),
        getSun(si, gungu),
      ]);

      const wJson = wRes.status === 'fulfilled' ? wRes.value : null;
      if (wRes.status === 'rejected') console.error('[weather fail]', wRes.reason);

      const wPayload = wJson?.result ?? wJson ?? null;
      const dataNode = wPayload?.data ?? wPayload ?? {};
      const core = dataNode?.summary ?? dataNode;

      const timeRaw =
        wPayload?.기준시각?.시간 ??
        dataNode?.기준시각?.시간 ?? '';
      const day =
        wPayload?.기준시각?.날짜 ??
        dataNode?.기준시각?.날짜 ?? '';

      const tempVal = core?.온도 ?? core?.temp ?? core?.temperature;
      const humidVal = core?.습도 ?? core?.humidity;
      const speedVal = core?.풍속 ?? core?.wind ?? core?.windSpeed;

      const feelsVal =
        core?.체감온도 ??
        core?.feels_like ??
        core?.apparentTemperature;

      const condVal =
        core?.날씨 ??
        core?.weather ??
        core?.condition ??
        core?.sky;

      const hhmm = typeof timeRaw === 'string' ? timeRaw.slice(0, 5) : '-';
      const dateLabel = (hhmm !== '-' || day) ? `${hhmm} • ${day}` : '-';

      const sJson = sRes.status === 'fulfilled' ? sRes.value : null;
      if (sRes.status === 'rejected') console.error('[sun fail]', sRes.reason);

      const sun = parseSun(sJson);

      setDate(dateLabel || '-');
      setTemperature(
        typeof tempVal === 'number' ? Math.round(tempVal) :
          (typeof tempVal === 'string' ? tempVal : '-')
      );
      setHumidity((typeof humidVal === 'number' || typeof humidVal === 'string') ? humidVal : '-');
      setSpeed((typeof speedVal === 'number' || typeof speedVal === 'string') ? speedVal : '-');
      setCondition(typeof condVal === 'string' ? condVal : '-');
      setPerceivedTemp(
        typeof feelsVal === 'number' ? Math.round(feelsVal) : (feelsVal ?? '-')
      );

      setSunrisetime(sun.success ? sun.sunrise : '-');
      setSunsettime(sun.success ? sun.sunset : '-');
    } catch (e) {
      console.error(e);
      setDate('-'); setTemperature('-'); setHumidity('-'); setSpeed('-');
      setSunrisetime('-'); setSunsettime('-');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function to12Hour(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return '-';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    const period = h < 12 ? 'am' : 'pm';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')}${period}`;
  }

  const goToLookRecommend = () => {
    const payload = {
      region,
      temperature: Number(temperature),
      humidity: Number(humidity),
      perceivedTemp: Number(perceivedTemp || temperature),
      condition,
      sido, gugun, date,
    };
    try { localStorage.setItem('lookPayload', JSON.stringify(payload)); } catch { }
    navigate('/lookrecommend', { state: payload });
  };

  const { src: weatherIcon, alt: weatherAlt } = getWeatherIconExact(condition);
  return (
    <div className="today-weather-page">
      <Menu />
      <div className="weather-content">
        <h2 className="today-weather-page-title">How's the weather?</h2>
        <div className="today-weather-region-selector">
          <RegionSelector
            onRegionSelect={handleRegionChange}
            initialSido="서울특별시"
            initialGugun="노원구"
          />
          <button
            className='today-weather-region-selector-button'
            onClick={applyRegion}
            disabled={!pending.sido || !pending.gugun || loading}
          >
            Select Region
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
              <img className="today-weather-icon" src={weatherIcon} alt={weatherAlt} />
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

        <button className="go-to-look-recommend" onClick={goToLookRecommend}>
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
