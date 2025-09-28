import React from 'react';
import '../../styles/LookPopup.css';

import close from '../../assets/images/popup-close.png';
import heartFilled from '../../assets/images/heart-filled.png';
import heartUnfilled from '../../assets/images/heart-unfilled.png';
import heartCount from '../../assets/images/heart-empty.png';

const LookPopup = ({ isOpen, onClose, look, isMyFeed = false, onLikeToggle, isLiked }) => {

    if (!isOpen || !look) return null;

    const handleLikeToggleInPopup = (e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        
        // 모든 로직은 부모 컴포넌트에서 처리하도록 위임합니다.
        // 부모는 look의 ID와 현재 좋아요 상태를 이미 알고 있습니다.
        onLikeToggle(look.looktoday_id, !isLiked);
    };

    return (
        <div className="look-popup-overlay" onClick={onClose}>
            <div className="look-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className='look-popup-nick'>{look.User?.nickname || '-'}님</div>
                <img src={close} className='look-popup-close' onClick={onClose} alt="close" />
                <hr />

                <div className='look-popup-body'>
                    <div className="look-popup-image">
                        {!isMyFeed && (
                            <img
                                src={isLiked ? heartFilled : heartUnfilled}
                                alt="heart"
                                onClick={handleLikeToggleInPopup}
                                className="look-popup-heart-btn"
                            />
                        )}
                        <img src={look.Image?.imageUrl} alt="룩 이미지" className="look-popup-main-img" />
                    </div>

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
                    
                    <div className="look-popup-date">
                        {look.date.replace(/-/g, '.')}
                    </div>

                    <div className="look-popup-like">
                        <div className="look-popup-heart-count">
                            <img src={heartCount} alt="heart-empty" className="look-popup-heart-icon" />
                            <span className="look-popup-like-count">{look.like_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LookPopup;