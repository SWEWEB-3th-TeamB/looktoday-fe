import React from 'react';
import heartFilled from '../assets/images/heart-filled.png';
import heartUnfilled from '../assets/images/heart-unfilled.png';
import heartCount from '../assets/images/heart-empty.png';
import '../styles/LookCard.css';

const LookCard = ({ image, locationTemp, nickname, likeCount, isLiked, onLikeToggle }) => {

    const handleLikeClick = (e) => {
        e.stopPropagation();
        
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