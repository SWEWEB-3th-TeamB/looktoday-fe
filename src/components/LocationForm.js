import React from 'react';
import { useState } from 'react';
import '../styles/Form.css';

import dropdown from '../assets/images/dropdown.png';
import dropdownUp from '../assets/images/dropdown-up.png';

const LocationForm = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isArrowDown, setIsArrowDown] = useState(true);

  const handleClick = () => {
    setIsArrowDown(prev => !prev);
    setIsDropdownVisible(prev => !prev);
  };

  return (
    <form className='location-form'>
      <div className='location-form-inputs'>
        <div className='location-dropdown' onClick={handleClick}>
          시/도
          {isArrowDown ? (
            <img src={dropdown} alt="dropdown" />
          ) : (
            <img src={dropdownUp} alt="dropdown-up" />
          )}
        </div>
        <div className='location-dropdown'>군/구<img src={dropdown} alt="dropdown" /></div>
      </div>
      {isDropdownVisible && (
        <div className='location-dropdown-box'>
          <div className='location-dropdown-option'>서울특별시</div>
          <div className='location-dropdown-option'>경기도</div>
          <div className='location-dropdown-option'>부산광역시</div>
          <div className='location-dropdown-option'>...</div>
        </div>
      )}
      <div className='form-error-message'>안내메시지</div>
    </form>
  );
};

export default LocationForm;
