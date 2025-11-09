import React from 'react';
import heartFilled from '../assets/images/heart-filled.png';
import heartUnfilled from '../assets/images/heart-unfilled.png';
import heartCount from '../assets/images/heart-empty.png';
import '../styles/LookCard.css';

const LookCard = ({ image, locationTemp, nickname, likeCount, isLiked, onLikeToggle }) => {

    const handleLikeClick = (e) => {
        // 하트 아이콘 클릭 시 부모 div의 클릭 이벤트(팝업 열기)가 실행되는 것을 방지
        e.stopPropagation();
        
        // 토큰 확인과 같은 모든 로직은 부모 컴포넌트에서 처리
        if (onLikeToggle) {
            onLikeToggle(!isLiked);
        }
    };

    return (
        <div className='look'>
            <img src={image} alt='lookbook' className='look-img' />
            <img
                src={isLiked  ? heartFilled : heartUnfilled}
                alt='heart'
                className='look-heart'
                onClick={handleLikeClick}
                style={{ cursor: 'pointer' }}
            />
            <div className='look-loc-temp'>{locationTemp}</div>
            <div className='look-nick'>{nickname}</div>
            <div className='look-heart-count'>
                <img src={heartCount} alt='heart-empty' />
                {likeCount}
            </div>
        </div>
    );
};

export default LookCard;