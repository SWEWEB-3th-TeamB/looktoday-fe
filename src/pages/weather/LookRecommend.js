import React, { useState } from 'react';
import lookRecommendData from './LookRecommendData';
import Menu from '../../components/Menu';
import '../../styles/LookRecommend.css';
import Weather from '../../assets/images/rainstorm.png';
import Footer from '../../components/Footer';

function LookRecommend() {
  const [region] = useState("서울특별시 노원구"); //임시 값들
  const [temperature] = useState(24); 
  const [humidity] = useState(69);
  const [isRaining] = useState(false); 
  const [perceivedTemp] = useState(26);

  // 조건 분기
  let condition = '';
  if (isRaining) {
    condition = temperature >= 10 ? 'HotRainy' : 'ColdRainy';
  } else {
    if (temperature >= 23) {
      condition = humidity >= 70 ? 'HotAndHumid' : 'HotAndDry';
    } else if (temperature >= 15) {
      condition = 'Mild';
    } else if (temperature >= 5) {
      condition = 'Chilly';
    } else {
      condition = 'Cold';
    }
  }

  const content = lookRecommendData[condition];

  const getImagePath = (folder, filename) =>
    require(`../../assets/images/LookRecommendPhoto/${folder}/${filename}`);

  return (
    <div className='look-recommend-page'>
      <Menu />
      <h2 className='look-recommend-title'>LookRecommend</h2>
      <div className='look-recommend-contents'>
        <div className='look-recommend-contents-firstline'>
          <div className='look-recommend-weather-wrapper'>
            <p className="look-recommend-weather-title">WAETHER</p>
            <div className='look-recommend-weather-card'>
              <img className="look-recommend-icon" src={Weather} alt="weather" />
              <p className="look-recommend-temparature">{temperature}°C</p>
              <p className="look-recommend-region">{region}</p>
              <p className="look-recommend-humidityperceivedtemperature">
                습도 {humidity}% 체감온도 {perceivedTemp} °C
              </p>
              <button className='look-recommend-region-select'>다른 지역 선택하기</button>
              <div className='look-recommend-comment'>
                #{content?.comments[0]}<br />#{content?.comments[1]}
              </div>
            </div>
          </div>

          <div className='look-recommend-help'></div>
          <div className='look-recommend-outfit-wrapper'>
            <div className='look-recommend-outfit-title'>OUTFIT</div>
            <div className='look-recommend-outfit'>
              {content?.outfits.map((img, idx) => (
                <img key={idx} className={`look-recommend-outfit${idx+1}`} src={getImagePath(condition, img)} alt={`outfit${idx+1}`} />
              ))}
            </div>
          </div>
        </div>

        <div className='look-recommend-contents-secondline'>
          <div className='look-recommend-weatheritem-wrapper'>
            <div className='look-recommend-weatheritem-title'>WEATHER ITEM</div>
            <div className='look-recommend-weatheritem'>
              {content?.weatherItems.map((img, idx) => (
                <img key={idx} className={`look-recommend-weatheritem${idx+1}`} src={getImagePath(condition, img)} alt={`weatheritem${idx+1}`} />
              ))}
            </div>
          </div>

          <div className='look-recommend-acc-wrapper'>
            <div className='look-recommend-acc-title'>ACC</div>
            <div className='look-recommend-acc'>
              {content?.accessories.map((img, idx) => (
                <img key={idx} className={`look-recommend-acc${idx+1}`} src={getImagePath(condition, img)} alt={`acc${idx+1}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    <Footer/>  
    </div>
  );
}

export default LookRecommend;
