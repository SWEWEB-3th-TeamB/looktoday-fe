import { useState, useEffect } from 'react';

import Menu from '../../components/Menu';
import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import LookCard from '../../components/LookCard';
import Pagination from '../../components/Pagination';
import Footer from '../../components/Footer';
import MyFeedCardOption from '../../components/MyFeedCardOption';

// import lookbook from '../../assets/images/lookbook-empty.png';

import '../../styles/MyFeed.css';

const MyFeed = () => {

  const [activeFilter, setActiveFilter] = useState(null); // '12m', '1m', '2m', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 페이지가 처음 렌더링될 때 내 피드 목록을 불러오는 함수
    const fetchMyPosts = async () => {
      try {
        // 로컬 스토리지에서 토큰 가져오기
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("로그인 토큰이 없습니다.");
          // 필요하다면 로그인 페이지로 보내는 처리
          return;
        }

        // 서버에 GET 요청 보내기
        const response = await fetch('http://43.203.195.97:3000/api/fetchPost', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');
        }

        const data = await response.json();

        // 받아온 데이터로 posts state 업데이트
        if (data.success) {
          setPosts(data.posts); // 서버 응답 형식에 따라 data.posts 또는 data.data 등으로 수정
        }

      } catch (error) {
        console.error("피드 로딩 중 오류:", error);
      }
    };

    fetchMyPosts(); // 함수 실행
  }, []); // []를 비워두면 컴포넌트가 처음 마운트될 때 딱 한 번만 실행됨.

  function getPrevMonth(offset=1) {
    let year = currentYear;
    let month = currentMonth - offset;
    if (month <= 0) {
      year--;
      month += 12;
    }
    return { year, month }; // {year: 2025, month: 7} 등
  }

  const prev1 = getPrevMonth(1); // 한달 전
  const prev2 = getPrevMonth(2); // 두달 전

  const prev1Text = `${prev1.month}월`; // 예: '7월'
  const prev2Text = `${prev2.month}월`; // 예: '6월'

  const handleSearch = () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert("시작 날짜가 종료 날짜보다 늦습니다.\n올바른 기간을 선택해 주세요.");
      return;
    }
    // 정상 조회 동작
  };

  const todayStr = new Date().toISOString().slice(0,10); // '2025-08-31'

  const handleStartDateChange = (date) => {
    if (date > todayStr) {
      alert("오늘 이후의 날짜는 선택할 수 없습니다.\n다시 선택해 주세요.");
      return;
    }
    setActiveFilter('custom');
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (date > todayStr) {
      alert("오늘 이후의 날짜는 선택할 수 없습니다.\n다시 선택해 주세요.");
      return;
    }
    setActiveFilter('custom');
    setEndDate(date);
  };

  const handleDeleteSuccess = (deletedId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedId));
  };

  return (
    <>
      <Menu />
      <Sidebar />
      <div className="myfeed-wrapper">

        <div className="myfeed-container">
          <h1 className="myfeed-title">MY FEED</h1>
        </div>

        <div className="myfeed-filter-bar">
          {/* 최근 12개월 */}
          <button
            className={`filter-btn-12m${activeFilter === '12m' ? ' active' : ''}`}
            onClick={() => {
              setActiveFilter('12m');
              // 기간 값 세팅 예시
              setStartDate(/* ...최근 12개월 시작일자... */);
              setEndDate(/* ...오늘 날짜... */);
            }}
          >최근 12개월</button>

          {/* 한달 전 */}
          <button
            className={`filter-btn-1m${activeFilter === '1m' ? ' active' : ''}`}
            onClick={() => {
              setActiveFilter('1m');
              setStartDate(/* ...한달 전 시작일자... */);
              setEndDate(/* ...한달 전 마지막일자... */);
            }}
          >{prev1Text}</button>

          {/* 두달 전 */}
          <button
            className={`filter-btn-2m${activeFilter === '2m' ? ' active' : ''}`}
            onClick={() => {
              setActiveFilter('2m');
              setStartDate(/* ...두달 전 시작일자... */);
              setEndDate(/* ...두달 전 마지막일자... */);
            }}
          >{prev2Text}</button>

          {/* 직접 기간 선택 (캘린더) */}
          <div className="filter-calendar-start">
            <Calendar
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <span className="filter-tilde">~</span>
          <div className="filter-calendar-end">
            <Calendar
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>

          {/* 조회 버튼: 두 날짜 모두 선택해야 활성화 */}
          <button
            className={`filter-btn-search${(startDate && endDate) ? ' active' : ''}`}
            disabled={!(startDate && endDate)}
            onClick={handleSearch}
          >조회</button>
        </div>

        <div className="myfeed-guide-text">
          최대 12개월 단위로 조회 가능하며, 최근 5년간의 게시물을 조회하실 수 있습니다.
        </div>

        <div className="myfeed-hr-container">
          <hr className="myfeed-hr" />
          <span className="myfeed-count-text">총 {posts.length}건</span>
        </div>

        <div className="myfeed-cards hide-nickname-heart">
          {posts.map(post => (
            <div key={post.id} className="myfeed-card-with-option" style={{ position: "relative", width: "224.5px" }}>
              <LookCard
                image={post.image}
                locationTemp={post.locationTemp}
                nickname={post.nickname}
                likeCount={post.likeCount}
                lookId={post.lookId}
                initiallyLiked={post.initiallyLiked} 
              />
              <MyFeedCardOption
                postData={post}
                onDeleteSuccess={handleDeleteSuccess}
              />
            </div>
          ))}
        </div>

        <div className="myfeed-pagination">
          <Pagination />
        </div>
      </div>

      <div className="myfeed-footer">
        <Footer />
      </div>
    </>
  );
};

export default MyFeed;