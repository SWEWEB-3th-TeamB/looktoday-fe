import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
import humid from '../../assets/images/humid.png';
import comfortable from '../../assets/images/comfortable.png';
import dry from '../../assets/images/dry.png';

const imageMap = { freezing, chilly, cool, warm, hot, sweltering };
const temperatureOptions = [
  { label: '무더워요', key: 'sweltering', color: '#D55E5E' },
  { label: '더워요', key: 'hot', color: '#E89270' },
  { label: '따뜻해요', key: 'warm', color: '#F9CA7E' },
  { label: '시원해요', key: 'cool', color: '#82D0D0' },
  { label: '쌀쌀해요', key: 'chilly', color: '#86B1EC' },
  { label: '추워요', key: 'freezing', color: '#476DB2' },
];
const humidityImageMap = { humid, comfortable, dry };
const humidityOptions = [
  { label: '습해요', key: 'humid' },
  { label: '괜찮아요', key: 'comfortable' },
  { label: '건조해요', key: 'dry' },
];

// 수정 API 호출 함수
async function updatePost(postId, token, updatedData) {
  const form = new FormData();
  // updatedData 객체의 모든 키-값 쌍을 FormData에 추가
  for (const key in updatedData) {
    form.append(key, updatedData[key]);
  }

  const res = await fetch(`/api/lookPost/${postId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  const responseText = await res.text();
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error("JSON 파싱 실패:", responseText);
    throw new Error("서버 응답이 올바르지 않습니다.");
  }
}

const LookTodayEdit = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false);
    navigate('/myfeed');
  };

  // 원본 데이터 상태 (API로부터 받은 상세 데이터)
  const [initialData, setInitialData] = useState(null);

  // 폼 상태 관리
  const [temperature, setTemperature] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [image, setImage] = useState(null); // 새로 업로드할 이미지 파일
  const [preview, setPreview] = useState(''); // 이미지 미리보기 URL
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedGugun, setSelectedGugun] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [humidity, setHumidity] = useState('');
  const [review, setReview] = useState('');

  const fileInputRef = useRef();
  const [isReviewFocused, setIsReviewFocused] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAndSetPostDetails = async () => {
      if (!postId || !token) {
        alert("게시물 정보를 불러올 수 없습니다.");
        navigate('/myfeed');
        return;
      }
      try {
        const response = await fetch(`/api/looks/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('내 룩 목록을 가져오는데 실패했습니다.');
        
        const data = await response.json();

        if (data.result && data.result.looks) {
          const currentPost = data.result.looks.find(
            (look) => look.looktoday_id === Number(postId)
          );

          if (currentPost) {
            console.log("API에서 찾은 현재 게시물 데이터:", currentPost);
            setInitialData(currentPost);
          } else {
            throw new Error('목록에서 현재 게시물을 찾을 수 없습니다. MyFeed로 돌아갑니다.');
          }
        } else {
          throw new Error(data.message || '게시물 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error("게시물 정보 로딩 중 오류:", error);
        alert(error.message);
        navigate('/myfeed');
      }
    };

    fetchAndSetPostDetails();
  }, [postId, token, navigate]);

  // initialData로 폼 상태를 초기화합니다. (/api/looks/me 응답 구조에 맞게 수정)
  useEffect(() => {
    if (initialData) {
      // 체감온도/습도는 '더워요' 같은 label 값이므로, UI 상태인 'hot' 같은 key 값으로 변환합니다.
      const tempOption = temperatureOptions.find(o => o.label === initialData.apparent_temp);
      const humidityOption = humidityOptions.find(o => o.label === initialData.apparent_humidity);

      setTemperature(tempOption ? tempOption.key : 'warm');
      setHumidity(humidityOption ? humidityOption.key : 'comfortable');
      
      // '/api/looks/me' 응답에 있는 필드들을 그대로 사용합니다.
      setDateValue(initialData.date || '');
      setSelectedTime(initialData.hour != null ? Number(initialData.hour) : null);
      setSelectedSido(initialData.si || '');
      setSelectedGugun(initialData.gungu || '');
      setIsPublic(initialData.isPublic === undefined ? true : initialData.isPublic);
      setPreview(initialData.Image?.imageUrl || '');
      setReview(initialData.comment || ''); 
    }
  }, [initialData]);

  const onChangeImage = e => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file); // 새로 선택된 파일 객체를 image state에 저장
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result); // 미리보기는 새 이미지로 교체
      reader.readAsDataURL(file);
    }
  };
  const handleTimeChange = (time) => setSelectedTime(time);
  const handleRegionChange = (value, regionType) => {
    if (regionType === 'sido') {
      setSelectedSido(value);
      setSelectedGugun('');
    } else {
      setSelectedGugun(value);
    }
  };
  const togglePublic = () => setIsPublic(prev => !prev);
  const handleReviewChange = e => {
    let value = e.target.value;
    if (value.length > 40) value = value.slice(0, 40);
    setReview(value);
  };

  // '수정 완료' 버튼 클릭 핸들러
  const handleUpdateClick = async () => {
    if (!initialData) return;

    const updatedData = {};

    const tempLabel = temperatureOptions.find(o => o.key === temperature)?.label;
    if (tempLabel && tempLabel !== initialData.apparent_temp) {
        updatedData.apparent_temp = tempLabel;
    }
    
    const humidityLabel = humidityOptions.find(o => o.key === humidity)?.label;
    if (humidityLabel && humidityLabel !== initialData.apparent_humidity) {
        updatedData.apparent_humidity = humidityLabel;
    }

    if (dateValue !== initialData.date) updatedData.date = dateValue;
    
    // [수정] hour 비교 로직 변경: 둘 다 문자열로 바꿔서 비교
    if (String(selectedTime) !== String(initialData.hour)) {
        updatedData.hour = selectedTime.toString();
    }

    if (selectedSido !== initialData.si) updatedData.si = selectedSido;
    if (selectedGugun !== initialData.gungu) updatedData.gungu = selectedGugun;
    if (isPublic !== initialData.isPublic) updatedData.isPublic = isPublic;
    if (review !== initialData.comment) updatedData.comment = review;
    if (image) updatedData.image = image;

    if (Object.keys(updatedData).length > 0) {
      try {
        const result = await updatePost(postId, token, updatedData);

        if (result.code === 'COMMON200') {
          setIsSuccessPopupOpen(true);
        } else {
          alert(result.message || "수정에 실패했습니다.");
        }

      } catch (error) {
        console.error("수정 중 오류 발생:", error);
        alert("수정 요청 중 오류가 발생했습니다.");
      }
    } else {
      setIsSuccessPopupOpen(true);
    }
  };
  
  // 렌더링할 UI가 없으면 로딩 처리 등을 할 수 있음
  if (!initialData) {
      return <div>게시물 정보를 불러오는 중입니다...</div>;
  }

  return (
    <>
      <div className="looktoday-wrapper">
        <div className="looktoday-container">
          <h1 className="looktoday-title">Edit My Look</h1>
        </div>
        
        <div className="temp-wrapper">
          <img src={imageMap[temperature]} alt="thermometer" className="thermometer" />
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
                }}
                onClick={() => setTemperature(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="calendar-btn-wrapper"><Calendar value={dateValue} onChange={setDateValue} /></div>
        <Time value={selectedTime} onChange={handleTimeChange} />
        <div className="record-number">No. {initialData.looktoday_id}</div>
        <hr className="looktoday-hr" />
        <div className="looktoday-location">
          <RegionSelector
            onRegionChange={handleRegionChange}
            initialSido={selectedSido}
            initialGugun={selectedGugun}
          />
        </div>
        <div className="public-toggle-label">공개</div>
        <div className={`public-toggle-switch ${isPublic ? 'public' : 'private'}`} onClick={togglePublic}>
          <div className="public-toggle-thumb" />
        </div>

        <div className="humidity-label">체감 습도</div>
        <img className="humidity-image" src={humidityImageMap[humidity]} alt={humidity} />
        {humidityOptions.map(({ label, key }) => (
          <button key={key} className={`humidity-btn ${key} ${humidity === key ? 'active' : ''}`} onClick={() => setHumidity(key)}>
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
          <label htmlFor="codi-upload-input" style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}>
            <img
              src={preview}
              alt="코디 미리보기"
              className="codi-image-preview-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
            />
          </label>
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
          {!review && !isReviewFocused && <span className="codi-review-placeholder">오늘의 코디 한 줄 평가</span>}
          <span className="codi-review-counter">{review.length} / 40</span>
        </div>

        <button
          className="complete-btn active" // 수정 페이지에서는 항상 활성화
          style={{ top: 765, left: 971, position: 'absolute' }}
          onClick={handleUpdateClick}
        >
          수정 완료
        </button>
      </div>
      <Menu />
      <div className="looktoday-footer">
        <Footer />
      </div>

      {isSuccessPopupOpen && (
        <>
          <div className="complete-popup-overlay" onClick={closeSuccessPopup} />
          <div className="complete-popup">
            <h2 className="complete-popup-title">
              <span>성공적으로 반영되었어요</span>
            </h2>
            <div className="complete-popup-desc">
              게시물 정보가 수정되었습니다{'\n'}변경된 내용을 확인해보세요
            </div>
            <button
              className="complete-popup-close-btn"
              onClick={closeSuccessPopup}
            >
              확인
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default LookTodayEdit;