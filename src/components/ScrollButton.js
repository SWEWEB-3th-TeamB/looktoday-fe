import '../styles/ScrollButton.css';

import arrowTop from '../assets/images/scroll-arrow-top.png'
import arrowBottom from '../assets/images/scroll-arrow-bottom.png'

const ScrollButton = () => {

    return (
        <div className='scroll-buttons'>
            <div className='scroll-button'><img src={arrowTop} alt='scroll-arrow-up' /></div>
            <div className='scroll-button'><img src={arrowBottom} alt='scroll-arrow-up' /></div>
        </div>
    );
}

export default ScrollButton;