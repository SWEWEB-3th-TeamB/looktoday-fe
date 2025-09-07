import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import Menu from '../../components/Menu';
import Calendar from '../../components/Calendar';
import Time from '../../components/Time';
import RegionSelector from '../../components/RegionSelector';
import Footer from '../../components/Footer';

import '../../styles/LookToday.css'; // 생성 페이지와 동일한 스타일 사용
import freezing from '../../assets/images/freezing.png';
import chilly from '../../assets/images/chilly.png';
import cool from '../../assets/images/cool.png';
import warm from '../../assets/images/warm.png';
import hot from '../../assets/images/hot.png';
import sweltering from '../../assets/images/sweltering.png';
// import plus from '../../assets/images/plus.png';
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

async function updatePost(postId, token, updatedData) {
  const form = new FormData();
  for (const key in updatedData) {
    const value = typeof updatedData[key] === 'boolean' ? String(updatedData[key]) : updatedData[key];
    form.append(key, value);
  }

  const res = await fetch(`http://43.203.195.97:3000/api/lookPost/${postId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  const responseText = await res.text();
  try {
    return JSON.parse(responseText);
  } catch (e) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }
}

const LookTodayEdit = () => {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [initialData] = useState(location.state?.initialData || null);
  
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
    if (initialData) {
      const tempKey = temperatureOptions.find(o => o.label === initialData.apparent_temp)?.key;
      const humidityKey = humidityOptions.find(o => o.label === initialData.apparent_humidity)?.key;

      setTemperature(tempKey || 'warm');
      setHumidity(humidityKey || 'comfortable');
      
      setDateValue(initialData.date);
      setSelectedTime(initialData.hour);
      setSelectedSido(initialData.si);
      setSelectedGugun(initialData.gungu);
      setIsPublic(initialData.isPublic);
      setPreview(initialData.image); // 기존 이미지 URL로 미리보기 설정
      setReview(initialData.comment);
    } else {
      alert("수정할 게시물 정보가 없습니다. 이전 페이지로 돌아갑니다.");
      navigate('/mypage/myfeed');
    }
  }, [initialData, navigate]);

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

  const handleUpdateClick = async () => {
    if (!initialData) return;
    const updatedData = {};

    const tempLabel = temperatureOptions.find(o => o.key === temperature)?.label;
    if (tempLabel && tempLabel !== initialData.apparent_temp) updatedData.apparent_temp = tempLabel;
    
    const humidityLabel = humidityOptions.find(o => o.key === humidity)?.label;
    if (humidityLabel && humidityLabel !== initialData.apparent_humidity) updatedData.apparent_humidity = humidityLabel;

    if (dateValue !== initialData.date) updatedData.date = dateValue;
    if (selectedTime !== initialData.hour) updatedData.hour = selectedTime.toString();
    if (selectedSido !== initialData.si) updatedData.si = selectedSido;
    if (selectedGugun !== initialData.gungu) updatedData.gungu = selectedGugun;
    if (isPublic !== initialData.isPublic) updatedData.isPublic = isPublic;
    if (review !== initialData.comment) updatedData.comment = review;
    if (image) updatedData.image = image; // 새 이미지가 있으면 추가

    if (Object.keys(updatedData).length > 0) {
      try {
        const result = await updatePost(postId, token, updatedData);
        if (result.success) {
          alert("게시물이 성공적으로 수정되었습니다.");
          navigate('/mypage/myfeed');
        } else {
          alert(result.message || "수정에 실패했습니다.");
        }
      } catch (error) {
        console.error("수정 중 오류 발생:", error);
        alert("수정 요청 중 오류가 발생했습니다.");
      }
    } else {
      alert("변경사항이 없습니다.");
    }
  };

  return (
    <>
      <Menu />
      <div className="looktoday-wrapper">
        <div className="looktoday-container">
          <h1 className="looktoday-title">Edit My Look</h1> {/* 제목 변경 */}
        </div>

        <button
          className="complete-btn active" // 수정 페이지에서는 항상 활성화 상태로 시작
          style={{ top: 765, left: 971, position: 'absolute' }}
          onClick={handleUpdateClick} // 핸들러 변경
        >
          수정 완료
        </button>
      </div>
      <div className="looktoday-footer">
        <Footer />
      </div>
    </>
  );
};

export default LookTodayEdit;