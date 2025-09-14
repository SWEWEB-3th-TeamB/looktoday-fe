import React, { useState } from 'react';
import '../../styles/LookPopup.css';

import close from '../../assets/images/popup-close.png';
import heartFilled from '../../assets/images/heart-filled.png';
import heartUnfilled from '../../assets/images/heart-unfilled.png';
import heartCount from '../../assets/images/heart-empty.png';

const LookPopup = ({ isOpen, onClose, look }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(look?.like_count || 0);
  if (!isOpen || !look) return null;

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setCount(count - 1);
    } else {
      setLiked(true);
      setCount(count + 1);
    }
  };

  return (
    <div className="look-popup-overlay" onClick={onClose}>
      <div className="look-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className='look-popup-nick'>{look.User?.nickname || '-'}님</div>
        <img src={close} className='look-popup-close' onClick={onClose} alt="close" />
        <hr />

        <div className='look-popup-body'>
          {/* 이미지 */}
          <div className="look-popup-image">
            {/* 하트 아이콘 */}
            <img
              src={liked ? heartFilled : heartUnfilled}
              alt="heart"
              onClick={handleLikeToggle}
              className="look-popup-heart-btn"
            />

            {/* 룩 이미지 */}
            <img src={look.Image?.imageUrl} alt="룩 이미지" className="look-popup-main-img" />
          </div>

          {/* 정보 */}
          <div className="look-popup-info">
            <div className="info-row">
              <span className="info-label">위치</span>
              <span className="info-value">{`${look.si} ${look.gungu}`}</span>
            </div>
            <div className="info-row">
              <span className="info-label">온도</span>
              <span className="info-value">{look.temperature ?? '-'}℃</span>
            </div>
            <div className="info-row">
              <span className="info-label">습도</span>
              <span className="info-value">{look.humidity ?? '-'}%</span>
            </div>
            <div className="info-row">
              <span className="info-label">체감 온도</span>
              <span className="info-value">{look.apparent_temp ?? '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">체감 습도</span>
              <span className="info-value">{look.apparent_humidity ?? '-'}</span>
            </div>

            <div className="info-row comment-row">
              <span className="info-label">코디 한줄 평가</span>
              <span className="info-value">{look.comment || '등록된 평가가 없습니다.'}</span>
            </div>
          </div>

          {/* 작성일 */}
          <div className="look-popup-date">
            {look.date.replace(/-/g, '.')}
          </div>

          {/* 좋아요 영역 */}
          <div className="look-popup-like">
            <div className="look-popup-heart-count">
              <img src={heartCount} alt="heart-empty" className="look-popup-heart-icon" />
              <span className="look-popup-like-count">{count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LookPopup;
