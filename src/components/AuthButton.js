import { useNavigate } from 'react-router-dom';

import '../styles/AuthButton.css';

const AuthButton = ({ to, text }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            console.log('이동 없음');
        }
    }

    return (
        <div className='authButton' onClick={handleClick}>{text}</div>
    );
}

export default AuthButton;