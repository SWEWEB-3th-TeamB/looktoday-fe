import React, { useState, useRef } from 'react';

import Menu from '../../components/Menu';
import Calendar from '../../components/Calendar';
import RegionSelector from '../../components/RegionSelector';
import Footer from '../../components/Footer';

import '../../styles/LookToday.css';

import sun from '../../assets/images/sun.png';
import cloud from '../../assets/images/cloud.png';
import rain from '../../assets/images/rain.png';
import snow from '../../assets/images/snow.png';

import freezing from '../../assets/images/freezing.png';
import chilly from '../../assets/images/chilly.png';
import cool from '../../assets/images/cool.png';
import warm from '../../assets/images/warm.png';
import hot from '../../assets/images/hot.png';
import sweltering from '../../assets/images/sweltering.png';

import plus from '../../assets/images/plus.png';

import humid from '../../assets/images/humid.png';
import comfortable from '../../assets/images/comfortable.png';
import dry from '../../assets/images/dry.png';

const imageMap = {
  freezing,
  chilly,
  cool,
  warm,
  hot,
  sweltering
};

const humidityImageMap = {
  humid,
  comfortable,
  dry,
};

const temperatureOptions = [
  { label: '무더워요', key: 'sweltering', color: '#D55E5E' },
  { label: '더워요', key: 'hot', color: '#E89270' },
  { label: '따뜻해요', key: 'warm', color: '#F9CA7E' },
  { label: '시원해요', key: 'cool', color: '#82D0D0' },
  { label: '쌀쌀해요', key: 'chilly', color: '#86B1EC' },
  { label: '추워요', key: 'freezing', color: '#476DB2' },
];

const humidityOptions = [
  { label: '습해요', key: 'humid', color: '#5D8CCF' },
  { label: '괜찮아요', key: 'comfortable', color: '#B8EFB3' },
  { label: '건조해요', key: 'dry', color: '#E56A6A' },
];

const LookToday = () => {
  const [selected, setSelected] = useState('warm');
  // 체감 습도 선택 상태
  const [humidity, setHumidity] = useState('comfortable');

  // 공개 여부 토글 상태
  const [isPublic, setIsPublic] = useState(true);

  // 공개 여부 토글 함수
  const togglePublic = () => setIsPublic(prev => !prev);

  // 기록 데이터와 lastId 상태 추가
  // eslint-disable-next-line no-unused-vars
  const [posts, setPosts] = useState([
    { id: 1, content: '첫 번째 기록' },
  ]);
  // eslint-disable-next-line no-unused-vars
  const [lastId, setLastId] = useState(1);

  // 새 기록 추가 함수 (원하는 시점에 호출)
  // eslint-disable-next-line no-unused-vars
  const addPost = (content) => {
    const newId = lastId + 1;
    setPosts([...posts, { id: newId, content }]);
    setLastId(newId);
  };

  // 기록 삭제 함수
  // eslint-disable-next-line no-unused-vars
  const deletePost = (id) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  // 파일 선택 핸들러
  const onChangeImage = e => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleReviewChange = e => {
    let value = e.target.value;
    if (value.length > 40) value = value.slice(0, 40);
    setReview(value);
  };


  const [review, setReview] = useState('');
  const [isReviewFocused, setIsReviewFocused] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [dateValue, setDateValue] = useState(null); // 선택된 날짜(예: 'YYYY-MM-DD')

  // 팝업 열림 상태
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);

  // 완료 버튼 활성화 조건 검사 함수
  const isCompleteEnabled = !!(
    dateValue && selected && humidity && preview && review.trim().length > 0
  );

  // 완료 버튼 클릭 핸들러
  const handleCompleteClick = () => {
    if (!isCompleteEnabled) return; // 비활성 상태일 땐 작동 안 함
    setIsCompletePopupOpen(true);
  };

  // 팝업 닫기
  const closePopup = () => {
    setIsCompletePopupOpen(false);
  };

  return (
    <>
      <div className="looktoday-wrapper">
        <Menu />
        <div className="looktoday-container">
          <h1 className="looktoday-title">Record My Look</h1>
        </div>

        <div className="calendar-btn-wrapper">
          <Calendar 
            value={dateValue}
            onChange={setDateValue}  // 캘린더가 선택 날짜 전달 함수
          />
        </div>

        <img src={sun} alt="맑음" className="icon-sun" />
        <img src={cloud} alt="구름" className="icon-cloud" />
        <img src={rain} alt="비" className="icon-rain" />
        <img src={snow} alt="눈" className="icon-snow" />

        {/* 기록 번호 표시 */}
        <div className="record-number">
          {posts.length > 0 ? `No. ${posts[posts.length - 1].id}` : 'No. 0'}
        </div>

        <hr className="looktoday-hr" />

        <div className="looktoday-location">
          <RegionSelector />
          <style>{`
            .looktoday-location .form-error-message { display: none !important; }
          `}</style>
        </div>

        {/* 공개 여부 토글 UI 시작 */}
        <div className="public-toggle-label">공개</div>

        <div
          className={`public-toggle-switch ${isPublic ? 'public' : 'private'}`}
          onClick={togglePublic}
          role="switch"
          aria-checked={isPublic}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePublic();
            }
          }}
        >
          <div className="public-toggle-thumb" />
        </div>
        {/* 공개 여부 토글 UI 끝 */}

        <div className="temp-wrapper">
          <img
            src={imageMap[selected]}
            alt="thermometer"
            className="thermometer"
          />
          <div className="temp-options">
            <div className="temp-label">체감 온도</div>
            {temperatureOptions.map((option) => (
              <button
                key={option.key}
                className={`temp-button ${selected === option.key ? 'active' : ''}`}
                style={{
                  backgroundColor: selected === option.key ? option.color : '#FFF',
                  border: selected === option.key ? 'none' : '1px solid #E2E2E2',
                  color: selected === option.key ? '#FFF' : '#2C2C2C',
                  textShadow: selected === option.key ? '1px 1px 5px rgba(0, 0, 0, 0.3)' : 'none'
                }}
                onClick={() => setSelected(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* ---------------------- 체감 습도 입력 ---------------------- */}

        <div className="humidity-label">체감 습도</div>

        {/* 체감 습도 이미지 */} 
        <img
          className="humidity-image"
          src={humidityImageMap[humidity]}
          alt={humidity}
        />

        {/* humidityOptions를 .map()으로 버튼 렌더링 */}
        {humidityOptions.map(({ label, key, color }) => (
          <button
            key={key}
            className={`humidity-btn ${key} ${humidity === key ? 'active' : ''}`}
            onClick={() => setHumidity(key)}
          >
            {label}
          </button>
        ))}

        <div className="codi-image-preview-box">
          {/* 파일 input ― 항상 하나만 둠 */}
          <input
            id="codi-upload-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={onChangeImage}
          />

          {/* 사진 없을 때: plus 버튼 label로 연결 */}
          {!preview && (
            <label
              className="codi-image-upload-btn"
              htmlFor="codi-upload-input"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <img src={plus} alt="사진 추가" />
            </label>
          )}

          {/* 사진 있을 때: img도 label로 감싸 input 연결 */}
          {preview && (
            <label
              htmlFor="codi-upload-input"
              className="codi-image-preview-img-label"
              style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
            >
              <img
                src={preview}
                alt="코디 미리보기"
                className="codi-image-preview-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
              />
            </label>
          )}

          {/* 설명문구 ― 사진 없을 때만 */}
          {!preview && (
            <div className="codi-image-upload-desc">코디를 추가하세요</div>
          )}
        </div>

        <div className="codi-review-input-wrapper">
          <textarea
            className="codi-review-input"
            value={review}
            onChange={handleReviewChange}
            onFocus={() => setIsReviewFocused(true)}
            onBlur={() => setIsReviewFocused(false)}
            rows={2}
          />
          {/* 가이드 텍스트 */}
          {!review && !isReviewFocused && (
            <span className="codi-review-placeholder">오늘의 코디 한 줄 평가</span>
          )}
          {/* 글자 카운트 */}
          <span className="codi-review-counter">{review.length} / 40</span>
        </div>

        {/* 예시: 날짜 선택 후 setDateValue(value) 호출 필요 */}
        {/* 완료 버튼 */}
        <button
          className={`complete-btn ${isCompleteEnabled ? 'active' : 'disabled'}`}
          style={{ top: 765, left: 971, position: 'absolute' }}
          onClick={handleCompleteClick}
          disabled={!isCompleteEnabled}
        >
          완료
        </button>

        {/* 팝업 - isCompletePopupOpen true 일 때 화면 전체 옵셥 박스 + 중앙 팝업 */}
        {isCompletePopupOpen && (
          <>
            <div className="complete-popup-overlay" onClick={closePopup} />
            <div className="complete-popup">
              <h2 className="complete-popup-title">
                <span className="title-english">LOOK TODAY</span>
                <span className="title-korean">에 당신의 감성이 더해졌어요</span>
              </h2>
              <div className="complete-popup-desc">
                오늘의 룩이 등록되었습니다{'\n'}마이페이지에서 확인해보세요
              </div>
              <button
                className="complete-popup-close-btn"
                onClick={closePopup}
              >
                확인
              </button>
            </div>
          </>
        )}
      </div>
      <div className="looktoday-footer">
        <Footer />
      </div>
    </>
  );
};

export default LookToday;
