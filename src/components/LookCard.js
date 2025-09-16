import { useState } from 'react';

import heartFilled from '../assets/images/heart-filled.png';
import heartUnfilled from '../assets/images/heart-unfilled.png';
import heartCount from '../assets/images/heart-empty.png';

import '../styles/LookCard.css';

async function likePost(lookId, token) {
    const res = await fetch(`https://looktoday.kr/api/looks/${lookId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return await res.json();
}

async function unlikePost(lookId, token) {
    const res = await fetch(`https://looktoday.kr/api/looks/${lookId}/like`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return await res.json();
}

const LookCard = ({ image, locationTemp, nickname, likeCount, lookId, initiallyLiked }) => {
    const [liked, setLiked] = useState(initiallyLiked);
    const [count, setCount] = useState(likeCount);

    const token = localStorage.getItem('access_token');


    const handleLikeToggle = async () => {
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        let result;
        if (!liked) {
            result = await likePost(lookId, token);
            if (result.code === "LIKE201") {
                setLiked(true);
                setCount(count + 1);
            } else if (result.code === "LIKE409") {
                alert("이미 좋아요를 누른 게시물입니다.");
            }
        } else {
            result = await unlikePost(lookId, token);
            if (result.code === "LIKE200") {
                setLiked(false);
                setCount(count - 1);
            } else if (result.code === "LIKE404") {
                alert("좋아요 기록을 찾을 수 없습니다.");
            }
        }

        if (result.message === "유효하지 않은 토큰입니다.") {
            alert("다시 로그인 후 시도해 주세요.");
        }
    };

    return (
        <div className='look'>
            <img src={image} alt='lookbook' className='look-img' />
            <img
                src={liked ? heartFilled : heartUnfilled}
                alt='heart'
                className='look-heart'
                onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle();
                }}
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

export default LookCard;