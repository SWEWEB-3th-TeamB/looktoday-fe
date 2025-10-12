import { useState, useEffect, useCallback } from 'react';
import Menu from '../../components/Menu';
import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import LookCard from '../../components/LookCard';
import Pagination from '../../components/Pagination';
import Footer from '../../components/Footer';
import LookPopup from '../lookbook/LookPopup';

import '../../styles/MyHeart.css';

// 좋아요 토글(취소)을 위한 API 호출 함수
async function toggleLikeApi(lookId, token) {
  // MyHeart 페이지에서는 항상 좋아요를 취소(DELETE)
  const res = await fetch(`/api/looks/${lookId}/like`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
}

const MyHeart = () => {
  // --- 상태 관리 ---
  const [posts, setPosts] = useState([]); // 좋아요 누른 게시물 목록
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // 필터 관련 상태
  const [activeFilter, setActiveFilter] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 팝업 관련 상태
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLook, setSelectedLook] = useState(null);
  const [loadingPopup, setLoadingPopup] = useState(false);

  // --- 데이터 Fetching ---
  const fetchMyHearts = useCallback(async (params = {}) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("로그인 토큰이 없습니다.");
      setLoading(false);
      return;
    }

    const query = new URLSearchParams(params).toString();
    const url = `/api/users/me/likes?${query}`; // API 엔드포인트 수정

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.result) {
        setPosts(data.result.myLikes || []); // 응답 데이터 키를 myLikes로 변경
        setTotalPosts(data.result.pagination.totalPosts || 0);
        setTotalPages(data.result.pagination.totalPages || 1);
        setCurrentPage(data.result.pagination.page || 1);
      } else {
        setPosts([]); setTotalPosts(0); setTotalPages(1);
      }
    } catch (error) {
      console.error("좋아요 목록 로딩 중 오류:", error);
      setPosts([]); setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 렌더링 시 데이터 로드
  useEffect(() => {
    fetchMyHearts({ page: 1 });
  }, [fetchMyHearts]);

  // --- 이벤트 핸들러 ---

  // 프리셋 필터 클릭 핸들러
  const handlePresetFilterClick = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setStartDate(''); setEndDate('');
      fetchMyHearts({ page: 1 });
    } else {
      setActiveFilter(filter);
      setStartDate(''); setEndDate('');
      fetchMyHearts({ period: filter, page: 1 });
    }
  };

  // 기간 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    if (!startDate || !endDate) {
      alert("시작 날짜와 종료 날짜를 모두 선택해 주세요.");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert("시작 날짜가 종료 날짜보다 늦습니다.\n올바른 기간을 선택해 주세요.");
      return;
    }
    setActiveFilter('custom');
    fetchMyHearts({ dateFrom: startDate, dateTo: endDate, page: 1 });
  };

  // 페이지네이션 페이지 변경 핸들러
  const handlePageChange = (page) => {
    const params = { page };
    if (activeFilter && activeFilter !== 'custom') {
      params.period = activeFilter;
    } else if (startDate && endDate) {
      params.dateFrom = startDate;
      params.dateTo = endDate;
    }
    fetchMyHearts(params);
  };

  // 좋아요 취소 핸들러
  const handleLikeToggle = async (lookId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }
    const result = await toggleLikeApi(lookId, token);
    if (result.code === "LIKE200") {
        // 성공적으로 좋아요가 취소되면 화면에서 해당 게시물을 즉시 제거
        setPosts(prevPosts => prevPosts.filter(post => post.looktoday_id !== lookId));
        setTotalPosts(prevTotal => prevTotal - 1);
        alert("좋아요가 취소되었습니다.");
    } else {
        alert(result.message || "요청에 실패했습니다.");
    }
  };

  // 상세 팝업 열기 핸들러
  const handleOpenPopup = async (post) => {
    setLoadingPopup(true);
    setIsPopupOpen(true);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/looks/${post.looktoday_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
      const data = await response.json();
      if (data.result) {
        const detailedData = data.result;
        const transformedLook = {
          ...detailedData,
          User: { nickname: detailedData.nickname },
          Image: { imageUrl: detailedData.imageUrl },
          si: '', // MyFeed와 동일하게 위치 정보 처리
          gungu: detailedData.location,
          like_count: detailedData.likeCount,
          looktoday_id: post.looktoday_id
        };
        setSelectedLook(transformedLook);
      } else {
        throw new Error(data.message || '상세 정보를 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error("상세 정보 로딩 중 오류:", error);
      alert("상세 정보를 불러오는 데 실패했습니다.");
      setIsPopupOpen(false);
    } finally {
      setLoadingPopup(false);
    }
  };

  // 팝업 닫기 핸들러
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedLook(null);
  };

  // --- 렌더링을 위한 변수 ---
  const today = new Date();
  const prev1Month = new Date(today.getFullYear(), today.getMonth() - 1).getMonth() + 1;
  const prev2Month = new Date(today.getFullYear(), today.getMonth() - 2).getMonth() + 1;
  const todayStr = new Date().toISOString().slice(0, 10);
  const handleStartDateChange = (date) => {
    if (date > todayStr) { alert("오늘 이후의 날짜는 선택할 수 없습니다.\n다시 선택해 주세요."); return; }
    setActiveFilter('custom'); setStartDate(date);
  };
  const handleEndDateChange = (date) => {
    if (date > todayStr) { alert("오늘 이후의 날짜는 선택할 수 없습니다.\n다시 선택해 주세요."); return; }
    setActiveFilter('custom'); setEndDate(date);
  };

  return (
    <>
      <Menu />
      <Sidebar />
      <div className="myheart-wrapper">

        <div className="myheart-container">
          <h1 className="myheart-title">MY HEART</h1>
        </div>

        <div className="myheart-filter-bar">
          <button className={`filter-btn-12m${activeFilter === '12m' ? ' active' : ''}`} onClick={() => handlePresetFilterClick('12m')}>최근 12개월</button>
          <button className={`filter-btn-1m${activeFilter === 'last-month' ? ' active' : ''}`} onClick={() => handlePresetFilterClick('last-month')}>{prev1Month}월</button>
          <button className={`filter-btn-2m${activeFilter === 'two-months-ago' ? ' active' : ''}`} onClick={() => handlePresetFilterClick('two-months-ago')}>{prev2Month}월</button>
          
          <div className="filter-calendar-start"><Calendar value={startDate} onChange={handleStartDateChange} /></div>
          <span className="filter-tilde">~</span>
          <div className="filter-calendar-end"><Calendar value={endDate} onChange={handleEndDateChange} /></div>
          <button className={`filter-btn-search${startDate && endDate ? ' active' : ''}`} disabled={!(startDate && endDate)} onClick={handleSearch}>조회</button>
        </div>

        <div className="myheart-guide-text">
          최대 12개월 단위로 조회 가능하며, 최근 5년간의 게시물을 조회하실 수 있습니다.
        </div>

        <div className="myheart-hr-container">
          <hr className="myheart-hr" />
          <span className="myheart-count-text">총 {totalPosts}건</span>
        </div>

        <div className="myheart-cards">
            {loading ? (<div>로딩 중...</div>) : posts.length > 0 ? (
                posts.map(post => (
                    <div key={post.looktoday_id} onClick={() => handleOpenPopup(post)}>
                        <LookCard
                            lookId={post.looktoday_id}
                            image={post.imageUrl}
                            locationTemp={`${post.si} ${post.gungu} · ${post.temperature ?? '-'}℃`}
                            nickname={post.nickname}
                            likeCount={post.likeCount}
                            isLiked={true} // MyHeart 페이지에서는 항상 true
                            onLikeToggle={() => handleLikeToggle(post.looktoday_id)}
                        />
                    </div>
                ))
            ) : (<div>좋아요를 누른 게시물이 없습니다.</div>)}
        </div>

        <div className="myheart-pagination">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      <div className="myheart-footer">
        <Footer />
      </div>

      <LookPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        look={selectedLook}
        isLoading={loadingPopup}
        isMyFeed={true} // 팝업 내 옵션 버튼 숨김
        isLiked={selectedLook?.isLiked}
        onLikeToggle={handleLikeToggle}
      />
    </>
  );
};

export default MyHeart;