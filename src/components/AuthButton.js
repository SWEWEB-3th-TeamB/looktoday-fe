import { useNavigate } from 'react-router-dom';
import '../styles/AuthButton.css';

const AuthButton = ({ to, text, onClick, disabled }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (to) {
      navigate(to);
    } else {
      console.log('이동 없음');
    }
  };

  return (
    <button
      type="button"
      className="authButton"
      onClick={handleClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default AuthButton;
