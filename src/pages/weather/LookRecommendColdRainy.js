import React, { useState } from 'react';
import Menu from '../../components/Menu';
import '../../styles/LookRecommend.css';
import Weathericon from '../../assets/images/13_heavy_rainstorm_color.png';
import Outfit1 from '../../assets/images/LookRecommendPhoto/ColdRainy/outfit1.png';
import Outfit2 from '../../assets/images/LookRecommendPhoto/ColdRainy/outfit2.png';
import Weatheritem1 from '../../assets/images/LookRecommendPhoto/ColdRainy/weatheritem1.png';
import Weatheritem2 from '../../assets/images/LookRecommendPhoto/ColdRainy/weatheritem2.png';
import Acc1 from '../../assets/images/LookRecommendPhoto/ColdRainy/acc1.png';
import Acc2 from '../../assets/images/LookRecommendPhoto/ColdRainy/acc2.png';
import Acc3 from '../../assets/images/LookRecommendPhoto/ColdRainy/acc3.png';

const LookRecommendColdRainy = ({ weatherData }) => {
    const [region, setRegion] = useState("서울특별시 노원구");
    const [temperature, setTemperature] = useState(24);
    const [humidity, setHumidity] = useState("10");
    const [perceivedtemparature, setperceivedTemparature] = useState(26)
    const [comment1, setcomment1] = useState("임시코멘트")
    const [comment2, setcomment2] = useState("임시코멘트")

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
                            <p className="LookRecommend-humidityperceivedtemperature">습도 {humidity}% 체감온도 {perceivedtemparature} °C</p>
                            <button className='LookRecommend-RegionSelect'>다른 지역 선택하기</button>
                        <div className='LookRecommend-comment'>#{comment1}<br/>#{comment2}</div>
                        </div>
                    </div>
                    <div className='LookRecommend-help'></div>
                    <div className='LookRecommend-outfit-wrapper'>
                        <div className='LookRecommend-outfit-title'>OUTFIT</div>
                        <div className='LookRecommend-outfit'>
                            <img className='LookRecommend-outfit1' src={Outfit1} alt="Outfit1"></img>
                            <img className='LookRecommend-outfit2' src={Outfit2} alt="Outfit2"></img>
                        </div>
                    </div>
                </div>
                <div className='LookRecommend-contents-secondline'>
                    <div className='LookRecommend-weatheritem-wrapper'>
                        <div className='LookRecommend-weatheritem-title'>WEATHER ITEM</div>
                        <div className='LookRecommend-weatheritem'>
                            <img className='LookRecommend-weatheritem1' src={Weatheritem1} alt="weatheritem1"></img>
                            <img className='LookRecommend-weatheritem2' src={Weatheritem2} alt="weatheritem2"></img>
                        </div>
                    </div>

                    <div className='LookRecommend-acc-wrapper'>
                        <div className='LookRecommend-acc-title'>ACC</div>
                        <div className='LookRecommend-acc'>
                            <img className='LookRecommend-acc1' src={Acc1} alt="acc1"></img>
                            <img className='LookRecommend-acc2' src={Acc2} alt="acc2"></img>
                            <img className='LookRecommend-acc3' src={Acc3} alt="acc3"></img>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LookRecommendColdRainy;