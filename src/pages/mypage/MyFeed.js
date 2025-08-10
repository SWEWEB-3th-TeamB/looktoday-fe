import { useState } from 'react';

import Menu from '../../components/Menu';
import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import LookCard from '../../components/LookCard';
import Pagination from '../../components/Pagination';
import Footer from '../../components/Footer';
import MyFeedCardOption from '../../components/MyFeedCardOption';

import lookbook from '../../assets/images/lookbook-empty.png';

import '../../styles/MyFeed.css';

const MyFeed = () => {

  const [activeFilter, setActiveFilter] = useState(null); // '12m', '1m', '2m', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const [posts] = useState([...Array(8)]); // 임시 데이터

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
              onChange={date => {
                setActiveFilter('custom');
                setStartDate(date);
              }}
            />
          </div>
          <span className="filter-tilde">~</span>
          <div className="filter-calendar-end">
            <Calendar
              value={endDate}
              onChange={date => {
                setActiveFilter('custom');
                setEndDate(date);
              }}
            />
          </div>

          {/* 조회 버튼: 두 날짜 모두 선택해야 활성화 */}
          <button
            className={`filter-btn-search${(startDate && endDate) ? ' active' : ''}`}
            disabled={!(startDate && endDate)}
            onClick={() => {
              if (startDate && endDate) {/* 조회 함수 실행 */}
            }}
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
            {[...Array(8)].map((_, index) => (
                <div key={index} className="myfeed-card-with-option" style={{ position: "relative", width: "224.5px" }}>
                    {/* 기존 카드 렌더링 */}
                    <LookCard
                        image={lookbook}
                        locationTemp="서울시 노원구 · 29℃"
                        nickname="닉네임"
                        likeCount={11}
                    />

                    {/* 옵션 버튼과 옵션창 */}
                    <MyFeedCardOption />
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