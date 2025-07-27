import React from 'react';
import '../styles/Form.css';

const Form = ({ type, placeholder }) => {
  return (
    <form className='form'>
        <input type={type} placeholder={placeholder} />
        <div className='form-error-message'>안내메시지</div>
    </form>
  );
};

export default Form;
