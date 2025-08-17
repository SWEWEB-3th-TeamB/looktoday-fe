import React, { useState } from 'react';
import Menu from '../../components/Menu';
import SouthKoreaMap from '../../components/SouthKoreaMap';
import RegionSelector from '../../components/RegionSelector';
import '../../styles/TodayWeather.css';
import Weather from '../../assets/images/rainstorm.png';
import Sunrise from '../../assets/images/sunrise.png';
import Sunset from '../../assets/images/sunset.png';
import Humidity from '../../assets/images/humidity.png';
import Speed from '../../assets/images/speed.png';
import Chevronright from '../../assets/images/chevronright.png';
import Footer from '../../components/Footer';

const TodayWeather = () => {
    // eslint-disable-next-line no-unused-vars
    const [region, setRegion] = useState("서울특별시 노원구");
    // eslint-disable-next-line no-unused-vars
    const [date, setdate] = useState("09:30 • 03/08 ")
    // eslint-disable-next-line no-unused-vars
    const [temperature, settemperature] = useState(24);
    // eslint-disable-next-line no-unused-vars
    const [sunrizetime, setsunrizetime] = useState("7:00");
    // eslint-disable-next-line no-unused-vars
    const [sunsettime, setsunsettime] = useState("7:00");
    // eslint-disable-next-line no-unused-vars
    const [humidity, sethumidity] = useState("10");
    // eslint-disable-next-line no-unused-vars
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
                <div className="today-weather-region-selector">
                    <RegionSelector onRegionChange={setSelectedRegion} />
                    <button className='today-weather-region-selector-button'>RegionSelector</button>
                </div>
                <SouthKoreaMap className="svg-map" selectedRegion={selectedRegion} regionTemperatures={regionTemperatures} />
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
                            <p className="today-weather-sunrise">{sunrizetime}am</p>
                            <p className="today-weather-sunset">{sunsettime}pm</p>
                        </div>
                    </div>
                    <div className="today-weather-humidity-card">
                        <div className="today-weather-humidity-contents">
                            <p className="today-weather-humidity-title">HUMIDITY</p>
                            <img className="today-weather-humitity-icon" src={Humidity} alt="humudity" />
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
                <button className="go-to-look-recommend">
                    룩 추천 보러가기
                    <img src={Chevronright} alt="chevronright" className="chevronright" />
                </button>
            </div>
            <div className='today-weather-footer'>
            <Footer/>
            </div>
        </div>
    )
}

export default TodayWeather;