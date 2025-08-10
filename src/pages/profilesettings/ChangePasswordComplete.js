import Menu from '../../components/Menu';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import complete from '../../assets/images/complete.png'

import '../../styles/ChangePasswordComplete.css';

const ChangePasswordComplete = () => {
    return (
        <div className="wrap">
            <Menu />
            <div className='change-password-complete-title'>Change Password</div>
            <div className='change-password-complete'>
                <img src={complete} alt='complete'/>
                <div className='change-password-complete-content'>ㅇㅇㅇ님의 비밀번호 변경이<br/>성공적으로 완료되었습니다.<br/>새로운 비밀번호로 로그인해주세요.</div>
                <div className='change-password-complete-btn'>
                    <AuthButton to='/login' text='로그인 하러가기' />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ChangePasswordComplete;