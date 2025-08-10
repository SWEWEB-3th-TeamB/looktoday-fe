import { useState } from 'react';

import '../styles/Form.css';

import eyeOn from '../assets/images/eye-on.png'
import eyeOff from '../assets/images/eye-off.png'

const Form = ({ type, placeholder, showEye }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleEye = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <form className='form'>
      <input
        type={showPassword ? 'text' : type}
        placeholder={placeholder}
      />
      <div className='form-error-message'>안내메시지</div>
      {showEye && (
        <img
          src={showPassword ? eyeOn : eyeOff}
          alt={showPassword ? 'eye-on' : 'eye-off'}
          onClick={toggleEye}
        />
      )}
    </form>
  );
};

export default Form;
