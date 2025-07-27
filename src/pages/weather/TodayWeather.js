import React, { useState } from 'react';
import Menu from '../../components/Menu';
import SouthKoreaMap from '../../components/SouthKoreaMap';
import RegionSelector from '../../components/RegionSelector';
import '../../styles/TodayWeather.css';
import Weathericon from '../../assets/images/13_heavy_rainstorm_color.png';
import Sunriseicon from '../../assets/images/sunrise.png';
import Sunseticon from '../../assets/images/sunset.png';
import Humidityicon from '../../assets/images/humidity.png';
import Speedicon from '../../assets/images/speed.png';
import Chevronright from '../../assets/images/chevronright.png';

const TodayWeather = () => {
    const [region, setRegion] = useState("서울특별시 노원구");
    const [date, setdate] = useState("09:30 • 03/08 ")
    const [temperature, settemperature] = useState(24);
    const [sunrizetime, setsunrizetime] = useState("7:00");
    const [sunsettime, setsunsettime] = useState("7:00");
    const [humidity, sethumidity] = useState("10");
    const [speed, setspeed] = useState("2");
    const [selectedRegion, setSelectedRegion] = useState('');
    const regionTemperatures = {
      '서울특별시': 28,
      '부산광역시': 33,
      '대구광역시': 31,
      '인천광역시': 27,
      '광주광역시': 30,
      '대전광역시': 29,
      '울산광역시': 32,
      '경기도': 28,
      '강원도': 26,
      '충청북도': 29,
      '충청남도': 30,
      '전라북도': 30,
      '전라남도': 31,
      '경상북도': 31,
      '경상남도': 32,
      '제주특별자치도': 33,
      '세종특별자치시': 28
    };

    return (
        <div className="today-weather-page">
        <Menu />
            <div className="weather-content">
                <h2 className="today-weather-page-title">How's the weather?</h2>
                <div  className="TodayWeather-RegionSelector">
                <RegionSelector onRegionChange={setSelectedRegion}/>
                <button className='TodayWeather-RegionSelector-button'>RegionSelector</button>
                </div>
                <SouthKoreaMap className="svg-map" selectedRegion={selectedRegion} regionTemperatures={regionTemperatures} />
                <div className="TodayWeather-mainWeather">
                    <div className="TodayWeather-left">
                        <p className="TodayWeather-region">{region}</p>
                        <p className="TodayWeather-date">{date}</p>
                        <p className="TodayWeather-temperature">{temperature}°C</p>
                    </div>
                    <div className="TodayWeather-right">
                        <img className="TodayWeather-icon" src={Weathericon} alt="Weathericon" />
                    </div>
                </div>
                <div className="TodayWeather-sunrisesunset">
                <div className="TodayWeather-sunrisesunset-contents">
                    <p className="TodayWeather-sunrisesunset-title">SUNRISE/SUNSET</p>
                    <img className="TodayWeather-sunrise-icon" src={Sunriseicon} alt="Sunriseicon" />
                    <img className="TodayWeather-sunset-icon" src={Sunseticon} alt="Sunseticon" />
                    <p className="TodayWeather-sunrise">{sunrizetime}am</p>
                    <p className="TodayWeather-sunset">{sunsettime}pm</p>
                </div>
                </div>
                <div className="TodayWeather-humidityCard">
                <div className="TodayWeather-humidity-contents">
                    <p className="TodayWeather-humidity-title">HUMIDITY</p>
                    <img className="TodayWeather-humitity-icon" src={Humidityicon} alt="humudityicon" />
                    <p className="TodayWeather-humidity">{humidity}%</p>
                </div>
                </div>
                <div className="TodayWeather-speedCard">
                <div className="TodayWeather-speed-contents">
                    <p className="TodayWeather-speed-title">SPEED</p>
                    <img className="TodayWeather-speed-icon" src={Speedicon} alt="speedicon" />
                    <p className="TodayWeather-speed">{speed}m/s</p>
                </div>
                </div>
                <button className="gotoLookRecommend">
                룩 추천 보러가기
                <img src={Chevronright} alt="chevronright" className="chevronright" />
                </button>
            </div>
        </div>
    )
}

export default TodayWeather;