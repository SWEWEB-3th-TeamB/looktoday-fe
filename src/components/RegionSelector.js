import { useState } from 'react';
import '../styles/RegionSelector.css';
import arrow from '../../src/assets/images/regoin-arrow.png';

const regions = {
  '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구',
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

  const handleSidoSelect = (value) => {
    setSido(value);
    setGugun('');
    onRegionChange(value);
    setSidoOpen(false);
    setGugunOpen(false); // 동시에 열리지 않도록
  };

  const handleGugunSelect = (value) => {
    setGugun(value);
    setGugunOpen(false);
    setSidoOpen(false); // 동시에 열리지 않도록
  };

  return (
    <div className="region-selector">
      <div className="region-selector-sido">
        <div
          className={`region-selector-form ${sido === '' ? 'placeholder' : ''}`}
          onClick={() => {
            setSidoOpen(!sidoOpen);
            setGugunOpen(false); // 다른 쪽 닫기
          }}
          tabIndex="0"
        >
          {sido || '시/도'}
          <img className={`arrow ${sidoOpen ? 'rotate' : ''}`} src={arrow} alt="arrow" />
        </div>
        {sidoOpen && (
          <ul className="region-selector-dropdown">
            {Object.keys(regions).map((region) => (
              <li key={region} onClick={() => handleSidoSelect(region)}>
                {region}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="region-selector-gugun">
        <div
          className={`region-selector-form ${!sido ? 'disabled' : ''}`}
          onClick={() => {
            if (!sido) return;
            setGugunOpen(!gugunOpen);
            setSidoOpen(false); // 다른 쪽 닫기
          }}
          tabIndex="0"
        >
          {gugun || '군/구'}
          <img className={`arrow ${gugunOpen ? 'rotate' : ''}`} src={arrow} alt="arrow" />
        </div>
        {gugunOpen && sido && (
          <ul className="region-selector-dropdown">
            {regions[sido].map((gugun) => (
              <li key={gugun} onClick={() => handleGugunSelect(gugun)}>
                {gugun}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RegionSelector;