import React, { useState } from 'react';
import '../styles/RegionSelector.css';
import arrow from '../../src/assets/images/iwwa_arrow-up.png';

const regions = {
  '서울특별시': [  '강남구', '강동구', '강북구', '강서구', '관악구',
                 '광진구', '구로구', '금천구', '노원구', '도봉구',
                 '동대문구', '동작구', '마포구', '서대문구', '서초구',
                 '성동구', '성북구', '송파구', '양천구', '영등포구',
                 '용산구', '은평구', '종로구', '중구', '중랑구'],
  '부산광역시': [],
  '대구광역시': [],
  '인천광역시': [],
  '광주광역시': [],
  '대전광역시': [],
  '울산광역시': [],
  '경기도': [],
  '강원도': [],
  '충청북도': [],
  '충청남도': [],
  '전라북도': [],
  '전라남도': [],
  '경상북도': [],
  '경상남도': [],
  '제주특별자치도': [],
  '세종특별자치시': []
};

const RegionSelector = ({ onRegionChange }) => {
  const [sido, setSido] = useState('');
  const [gugun, setGugun] = useState('');
  const [sidoOpen, setSidoOpen] = useState(false);
  const [gugunOpen, setGugunOpen] = useState(false);

  const handleSidoChange = (e) => {
    const value = e.target.value;
    console.log("사용자가 선택한 시/도:", value); 
    setSido(value);
    setGugun('');
    onRegionChange(value);
  };

  return (
    <div className="region-selector">
      <div className="region-selector-sido">
        <select className="RegionSelector-form" 
          value={sido}
          onChange={handleSidoChange}
          onMouseDown={() => setSidoOpen((prev) => !prev)}
          onBlur={() => setSidoOpen(false)}
        >
          <option value="">시/도</option>
          {Object.keys(regions).map((sido) => (
            <option key={sido} value={sido}>{sido}</option>
          ))}
        </select>
        <img className={`arrow ${sidoOpen ? 'rotate' : ''}`} src={arrow} alt="arrow" />
      </div>

      <div className="region-selector-gugun">
        <select className="RegionSelector-form" value={gugun}
          onChange={(e) => setGugun(e.target.value)}
          disabled={!sido}
          onMouseDown={() => setGugunOpen((prev) => !prev)}
          onBlur={() => setGugunOpen(false)}
        >
          <option value="">군/구</option>
          {sido &&
            regions[sido].map((gugun) => (
              <option key={gugun} value={gugun}>{gugun}</option>
            ))}
        </select>
        <img className={`arrow ${gugunOpen ? 'rotate' : ''}`} src={arrow} alt="arrow" />
      </div>
    </div>
  );
};

export default RegionSelector;