import React, { useState } from 'react';
import lookRecommendData from './LookRecommendData';
import Menu from '../../components/Menu';
import '../../styles/LookRecommend.css';
import Weathericon from '../../assets/images/rainstorm.png';
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
    <div className='LookRecommend-page'>
      <Menu />
      <h2 className='LookRecommend-title'>LookRecommend</h2>
      <div className='LookRecommend-contents'>
        <div className='LookRecommend-contents-firstline'>
          <div className='LookRecommend-weather-wrapper'>
            <p className="LookRecommend-weather-title">WAETHER</p>
            <div className='LookRecommend-weather-card'>
              <img className="LookRecommend-icon" src={Weathericon} alt="Weathericon" />
              <p className="LookRecommend-temparature">{temperature}°C</p>
              <p className="LookRecommend-region">{region}</p>
              <p className="LookRecommend-humidityperceivedtemperature">
                습도 {humidity}% 체감온도 {perceivedTemp} °C
              </p>
              <button className='LookRecommend-RegionSelect'>다른 지역 선택하기</button>
              <div className='LookRecommend-comment'>
                #{content?.comments[0]}<br />#{content?.comments[1]}
              </div>
            </div>
          </div>

          <div className='LookRecommend-help'></div>
          <div className='LookRecommend-outfit-wrapper'>
            <div className='LookRecommend-outfit-title'>OUTFIT</div>
            <div className='LookRecommend-outfit'>
              {content?.outfits.map((img, idx) => (
                <img key={idx} className={`LookRecommend-outfit${idx+1}`} src={getImagePath(condition, img)} alt={`outfit${idx+1}`} />
              ))}
            </div>
          </div>
        </div>

        <div className='LookRecommend-contents-secondline'>
          <div className='LookRecommend-weatheritem-wrapper'>
            <div className='LookRecommend-weatheritem-title'>WEATHER ITEM</div>
            <div className='LookRecommend-weatheritem'>
              {content?.weatherItems.map((img, idx) => (
                <img key={idx} className={`LookRecommend-weatheritem${idx+1}`} src={getImagePath(condition, img)} alt={`weatheritem${idx+1}`} />
              ))}
            </div>
          </div>

          <div className='LookRecommend-acc-wrapper'>
            <div className='LookRecommend-acc-title'>ACC</div>
            <div className='LookRecommend-acc'>
              {content?.accessories.map((img, idx) => (
                <img key={idx} className={`LookRecommend-acc${idx+1}`} src={getImagePath(condition, img)} alt={`acc${idx+1}`} />
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
