import '../styles/ScrollButton.css';
import arrowTop from '../assets/images/scroll-arrow-top.png';
import arrowBottom from '../assets/images/scroll-arrow-bottom.png';

const ScrollButton = () => {

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // bottom 속성 없음
  };

  return (
    <div className='scroll-buttons'>
      <div className='scroll-button' onClick={handleScrollToTop}>
        <img src={arrowTop} alt='scroll-arrow-up' />
      </div>
      <div className='scroll-button' onClick={handleScrollToBottom}>
        <img src={arrowBottom} alt='scroll-arrow-down' />
      </div>
    </div>
  );
};

export default ScrollButton;
