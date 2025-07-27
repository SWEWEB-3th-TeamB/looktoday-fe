import Menu from '../../components/Menu';
import AuthButton from '../../components/AuthButton';
import Footer from '../../components/Footer';

import complete from '../../assets/images/complete.png'

import '../../styles/SignUpComplete.css';

const SignUpComplete = () => {
    return (
        <div className="wrap">
            <Menu />
            <div className='sign-up-complete'>
                <div className='sign-up-complete-title'>Sign Up</div>
                <img src={complete} alt='complete'/>
                <div className='sign-up-complete-content'>ㅇㅇㅇ님의 회원가입이<br/>성공적으로 완료되었습니다.</div>
                <div className='sign-up-complete-btn'>
                    <AuthButton to='/login' text='로그인 하러가기' />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default SignUpComplete;