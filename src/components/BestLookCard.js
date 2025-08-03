import { useState } from 'react';

import heartFilled from '../assets/images/heart-filled.png';
import heartUnfilled from '../assets/images/heart-unfilled.png';
import heartCount from '../assets/images/heart-empty.png';

import '../styles/LookCard.css';

const BestLookCard = ({ image, rank, locationTemp, nickname, likeCount }) => {
    const [liked, setLiked] = useState(false);

    const handleLikeToggle = () => {
        setLiked(!liked);
    };

    return (
        <div className='best-look'>
            <img src={image} alt='lookbook' className='best-look-img' />
            <div className='look-num'>{rank}</div>
            <img
                src={liked ? heartFilled : heartUnfilled}
                alt='heart'
                className='best-look-heart'
                onClick={handleLikeToggle}
                style={{ cursor: 'pointer' }}
            />
            <div className='look-loc-temp'>{locationTemp}</div>
            <div className='look-nick'>{nickname}</div>
            <div className='look-heart-count'>
                <img src={heartCount} alt='heart-empty' />{likeCount}
            </div>
        </div>
    );
};


export default BestLookCard;
