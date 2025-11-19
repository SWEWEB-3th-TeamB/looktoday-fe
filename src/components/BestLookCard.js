import React from 'react';

import heartFilled from '../assets/images/heart-filled.png';
import heartUnfilled from '../assets/images/heart-unfilled.png';
import heartCount from '../assets/images/heart-empty.png';

import '../styles/LookCard.css';

const BestLookCard = ({
    image,
    rank,
    temperature,
    nickname,
    likeCount,
    location,
    isLiked,
    onLikeToggle,
}) => {
    const handleHeartClick = (e) => {
        e.stopPropagation();
        onLikeToggle && onLikeToggle(!isLiked);
    };

    return (
        <div className='best-look'>
            <img src={image} alt='lookbook' className='best-look-img' />
            <div className='look-num'>{rank}</div>

            <img
                src={isLiked ? heartFilled : heartUnfilled}
                alt='heart'
                className='best-look-heart'
                onClick={handleHeartClick}
                style={{ cursor: 'pointer' }}
            />

            <div className='look-loc-temp'>
                {location} · {temperature}℃
            </div>

            <div className='look-nick'>{nickname}</div>

            <div className='look-heart-count'>
                <img src={heartCount} alt='heart-empty' />
                {likeCount}
            </div>
        </div>
    );
};

export default BestLookCard;