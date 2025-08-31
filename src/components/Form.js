import { useMemo, useState } from 'react';

import '../styles/Form.css';

import eyeOn from '../assets/images/eye-on.png'
import eyeOff from '../assets/images/eye-off.png'

const Form = ({
  type,
  name,
  placeholder,
  showEye,
  value,
  onChange,
  required = false,
  compareWith,
  customMessages = {},
  onValidChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const toggleEye = () => {
    setShowPassword(prev => !prev);
  };

  // 기본 메시지
  const M = {
    required: '필수 입력 항목입니다.',
    invalidEmail: '이메일 형식이 올바르지 않습니다.',
    weakPasswordLen: '비밀번호는 8자 이상이어야 합니다.',
    weakPasswordSpecial: '비밀번호에 특수문자를 최소 1개 포함해 주세요.',
    notMatch: '비밀번호가 일치하지 않습니다.',
    ...customMessages,
  };

  const error = useMemo(() => {
    const v = (value ?? '').trim();

    if (required && v.length === 0) return M.required;

    if (!required && v.length === 0) return '';

    if (name === 'email') {
      const ok = /^\S+@\S+\.\S+$/.test(v);
      if (!ok) return M.invalidEmail;
    }

    if (name === 'password') {
      if (v.length < 8) return M.weakPasswordLen;
      if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\]/.test(v)) return M.weakPasswordSpecial;
    }

    if (name === 'confirmPassword') {
      if (v !== (compareWith ?? '')) return M.notMatch;
    }

    return '';
  }, [name, value, required, compareWith, M]);


  return (
    <div className='form'>
      <input
        name={`signup-${name}`}
        autoComplete={
          name === 'password' || name === 'confirmPassword'
            ? 'new-password'
            : 'off'
        }
        autoCapitalize="none"
        spellCheck={false}
        type={showPassword ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange?.(e);
        }}
        onBlur={() => {
          setTouched(true);
          onValidChange?.(!error);
        }}
        aria-invalid={touched && !!error}
        aria-describedby={touched && error ? `${name}-error` : undefined}
      />

      {showEye && type === 'password' && (
        <img
          src={showPassword ? eyeOn : eyeOff}
          alt={showPassword ? 'eye-on' : 'eye-off'}
          onClick={() => setShowPassword((p) => !p)}
          role='button'
          tabIndex={0}
        />
      )}

      <div id={`${name}-error`} className='form-error-message'>
        {touched ? error : ' '}
      </div>
    </div>
  );
};

export default Form;
