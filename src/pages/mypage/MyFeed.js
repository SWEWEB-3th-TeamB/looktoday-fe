import { useState, useEffect, useCallback } from 'react';

import Menu from '../../components/Menu';
import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import LookCard from '../../components/LookCard';
import Pagination from '../../components/Pagination';
import Footer from '../../components/Footer';
import MyFeedCardOption from '../../components/MyFeedCardOption';

import '../../styles/MyFeed.css';

const MyFeed = () => {

  const [activeFilter, setActiveFilter] = useState(null); // '12m', '1m', '2m', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [posts, setPosts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMyPosts = useCallback(async (page) => {
    try {
      // 로컬 스토리지에서 토큰 가져오기
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("로그인 토큰이 없습니다.");
        // 필요하다면 로그인 페이지로 보내는 처리
        return;
      }

      // 서버에 GET 요청 보내기
      const response = await fetch(`http://43.203.195.97:3000/api/looks?page=${page}&limit=8`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');
      }

      const data = await response.json();

      if (data.code === "COMMON200" && data.result?.looks) {
        setPosts(data.result.looks);
      } else {
        setPosts([]); // 데이터가 없는 경우 빈 배열로 초기화
      }

    } catch (error) {
      console.error("피드 로딩 중 오류:", error);
      setPosts([]); // 에러 발생 시 빈 배열로 초기화
    }
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성

  useEffect(() => {
    fetchMyPosts(currentPage); // 컴포넌트가 마운트될 때 데이터 가져오기 실행
  }, [currentPage, fetchMyPosts]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

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
    setPosts(prevPosts => prevPosts.filter(post => post.looktoday_id !== deletedId));
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
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.looktoday_id} className="myfeed-card-with-option" style={{ position: "relative", width: "224.5px" }}>
                <LookCard
                  lookId={post.looktoday_id}
                  image={post.Image?.imageUrl}
                  locationTemp={`${post.si} ${post.gungu} · ${post.temperature ?? '-'}℃`}
                  // nickname={post.nickname}
                  likeCount={post.like_count}
                  // initiallyLiked={post.initiallyLiked} 
                />
                <MyFeedCardOption
                  postData={post}
                  onDeleteSuccess={() => handleDeleteSuccess(post.looktoday_id)}
                />
              </div>
            ))
          ) : (
            <div>작성한 게시물이 없습니다.</div> // 데이터가 없을 때 표시할 메시지
          )}
        </div>

        <div className="myfeed-pagination">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage} // 페이지 번호를 클릭하면 currentPage 상태가 변경됨
          />
        </div>
      </div>

      <div className="myfeed-footer">
        <Footer />
      </div>
    </>
  );
};

export default MyFeed;