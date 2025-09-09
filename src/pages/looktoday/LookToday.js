import { useState, useRef } from 'react';
import { useCallback } from "react";

import Menu from '../../components/Menu';
import Calendar from '../../components/Calendar';
import Time from '../../components/Time';
import RegionSelector from '../../components/RegionSelector';
import Footer from '../../components/Footer';

import '../../styles/LookToday.css';

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

const temperatureOptions = [
  { label: '무더워요', key: 'sweltering', color: '#D55E5E' },
  { label: '더워요', key: 'hot', color: '#E89270' },
  { label: '따뜻해요', key: 'warm', color: '#F9CA7E' },
  { label: '시원해요', key: 'cool', color: '#82D0D0' },
  { label: '쌀쌀해요', key: 'chilly', color: '#86B1EC' },
  { label: '추워요', key: 'freezing', color: '#476DB2' },
];

const humidityImageMap = {
  humid,
  comfortable,
  dry,
};

const humidityOptions = [
  { label: '습해요', key: 'humid' },
  { label: '괜찮아요', key: 'comfortable' },
  { label: '건조해요', key: 'dry' },
];

async function uploadPost({
  image,            // File 객체
  date,             // YYYY-MM-DD (string)
  hour,             // 예: "14"
  isPublic,         // true 또는 false
  si,               // 시/도
  gungu,            // 구/군
  apparent_temp,    // 체감온도
  apparent_humidity,// 체감습도
  comment,          // 코멘트
  token             // Bearer Token
}) {
  const form = new FormData();
  form.append('image', image);
  form.append('date', date);
  form.append('hour', hour);
  form.append('isPublic', String(isPublic));
  form.append('si', si);
  form.append('gungu', gungu);
  form.append('apparent_temp', apparent_temp);
  form.append('apparent_humidity', apparent_humidity);
  form.append('comment', comment);

  const res = await fetch('http://43.203.195.97:3000/api/lookPost', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  // 서버가 500 에러 등으로 JSON이 아닌 응답을 줄 경우를 대비
  const responseText = await res.text();
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error("JSON 파싱 실패:", responseText);
    throw new Error("서버 응답이 올바르지 않습니다.");
  }
}

const LookToday = () => {
  const [temperature, setTemperature] = useState('warm');
  const [dateValue, setDateValue] = useState(null); // 선택된 날짜(예: 'YYYY-MM-DD')
  const [selectedTime, setSelectedTime] = useState(null); // 시간 선택 상태

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  const [posts, setPosts] = useState([]);
  const [lastId, setLastId] = useState(0);

  // 작성 중 표시될 번호 (미리보기용)
  const currentPostNumber = lastId + 1;

  // 파일 선택 핸들러
  const onChangeImage = e => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  // 시/도, 구/군 선택 상태
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedGugun, setSelectedGugun] = useState('');

  // RegionSelector에서 선택값 받을 함수
  const handleRegionChange = useCallback((value, regionType) => {
    if (regionType === 'sido') {
      setSelectedSido(value);
      setSelectedGugun(''); // 시/도가 변경되면 군/구 초기화
    } else if (regionType === 'gugun') {
      setSelectedGugun(value);
    }
  }, []);

  // 공개 여부 토글 상태
  const [isPublic, setIsPublic] = useState(true);

  // 공개 여부 토글 함수
  const togglePublic = () => setIsPublic(prev => !prev);

  // 체감 습도 선택 상태
  const [humidity, setHumidity] = useState('comfortable');

  const [review, setReview] = useState('');
  const [isReviewFocused, setIsReviewFocused] = useState(false);

  const token = localStorage.getItem("token");

  const handleReviewChange = e => {
    let value = e.target.value;
    if (value.length > 40) value = value.slice(0, 40);
    setReview(value);
  };

  console.log("isCompleteEnabled 조건 값 확인:", {
    dateValue: dateValue,
    temperature: temperature,
    humidity: humidity,
    preview: preview,
    isReviewValid: review.trim().length > 0,
    isTimeSelected: selectedTime !== null,
    isSidoSelected: selectedSido !== '',
    isGugunSelected: selectedGugun !== ''
  });

  // 완료 버튼 활성화 조건 검사 함수
  const isCompleteEnabled = !!(
    dateValue && 
    temperature && 
    humidity && 
    preview && 
    review.trim().length > 0 && 
    selectedTime !== null && 
    selectedSido !== '' &&
    selectedGugun !== ''
  );

  // 완료 버튼 클릭 핸들러
  const handleCompleteClick = async () => {
    if (!isCompleteEnabled) return;

    // 선택된 key에 해당하는 한글 label 찾기
    const tempLabel = temperatureOptions.find(option => option.key === temperature)?.label;
    const humidityLabel = humidityOptions.find(option => option.key === humidity)?.label;

    // 만약 해당하는 label을 찾지 못하면 함수 종료
    if (!tempLabel || !humidityLabel) {
      alert("온도 또는 습도 값이 유효하지 않습니다.");
      return;
    }

    // 확인 (디버깅용)
    console.log({
      image,
      date: dateValue,
      hour: selectedTime,
      isPublic,
      si: selectedSido,
      gungu: selectedGugun,
      apparent_temp: tempLabel, // 영문 key 대신 한글 label 전송
      apparent_humidity: humidityLabel, // 영문 key 대신 한글 label 전송
      comment: review,
      token
    });

    try {
      const result = await uploadPost({
        image,
        date: dateValue,
        hour: selectedTime ? selectedTime.toString() : '',
        isPublic: isPublic, // boolean 값을 그대로 전달
        si: selectedSido,
        gungu: selectedGugun,
        apparent_temp: tempLabel, // 수정된 값
        apparent_humidity: humidityLabel, // 수정된 값
        comment: review,
        token
      });

      if (result.success || result.message?.includes("성공")) {
        // 고유 번호는 "완료된 시점"에만 증가
        const newId = lastId + 1;
        // posts에 실제 데이터 추가
        setPosts([...posts, { id: newId, content: review }]);
        // lastId 업데이트
        setLastId(newId);
        // 성공 시 팝업 열기
        setIsCompletePopupOpen(true);
        // 등록 성공시 마이페이지 이동 등 처리
      } else {
        alert(result.message || "업로드에 실패했습니다.");
      }
    }catch (error) {
      // JSON 파싱 에러 등 네트워크 외 에러 처리
      console.error("업로드 처리 중 오류 발생:", error);
      alert("서버로부터 올바른 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // 팝업 열림 상태
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);

  // 팝업 닫기
  const closePopup = () => {
    setIsCompletePopupOpen(false);
  };

  return (
    <>
      <div className="looktoday-wrapper">

        <div className="looktoday-container">
          <h1 className="looktoday-title">Record My Look</h1>
        </div>

        <div className="temp-wrapper">
          <img
            src={imageMap[temperature]}
            alt="thermometer"
            className="thermometer"
          />
          <div className="temp-options">
            <div className="temp-label">체감 온도</div>
            {temperatureOptions.map((option) => (
              <button
                key={option.key}
                className={`temp-button ${temperature === option.key ? 'active' : ''}`}
                style={{
                  backgroundColor: temperature === option.key ? option.color : '#FFF',
                  border: temperature === option.key ? 'none' : '1px solid #E2E2E2',
                  color: temperature === option.key ? '#FFF' : '#2C2C2C',
                  textShadow: temperature === option.key ? '1px 1px 5px rgba(0, 0, 0, 0.3)' : 'none'
                }}
                onClick={() => setTemperature(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="calendar-btn-wrapper">
          <Calendar 
            value={dateValue}
            onChange={setDateValue}
          />
        </div>

        <Time value={selectedTime} onChange={handleTimeChange} />

        <div className="record-number">
          No. {currentPostNumber}
        </div>

        <hr className="looktoday-hr" />

        <div className="looktoday-location">
          <RegionSelector
            onRegionChange={(value, type) => {
              handleRegionChange(value, type);
            }}
            selectedSido={selectedSido}
            selectedGugun={selectedGugun}
          />
          <style>{`
            .looktoday-location .form-error-message { display: none !important; }
          `}</style>
        </div>

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

        <div className="humidity-label">체감 습도</div>
        <img
          className="humidity-image"
          src={humidityImageMap[humidity]}
          alt={humidity}
        />
        {humidityOptions.map(({ label, key }) => (
          <button
            key={key}
            className={`humidity-btn ${key} ${humidity === key ? 'active' : ''}`}
            onClick={() => setHumidity(key)}
          >
            {label}
          </button>
        ))}

        <div className="codi-image-preview-box">
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
          {!review && !isReviewFocused && (
            <span className="codi-review-placeholder">오늘의 코디 한 줄 평가</span>
          )}
          <span className="codi-review-counter">{review.length} / 40</span>
        </div>

        <button
          className={`complete-btn ${isCompleteEnabled ? 'active' : 'disabled'}`}
          style={{ top: 765, left: 971, position: 'absolute' }}
          onClick={handleCompleteClick}
          disabled={!isCompleteEnabled}
        >
          완료
        </button>

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

      <Menu />

      <div className="looktoday-footer">
        <Footer />
      </div>
      
    </>
  );
};

export default LookToday;