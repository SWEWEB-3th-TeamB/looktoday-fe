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
  const [activeFilter, setActiveFilter] = useState(null); // '12m', 'last-month', 'two-months-ago', 'custom'
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

    // [수정]
    // 1. params를 복사하여 'page' 기본값을 1로 설정
    const queryParams = { page: 1, ...params };

    // 2. [핵심 수정]
    // 'period'나 'dateFrom' 파라미터가 없는 경우 (e.g., 최초 로드 시 {page: 1}만 있을 때)
    // API 명세의 기본값인 'period=5y'를 명시적으로 추가합니다.
    if (!queryParams.period && !queryParams.dateFrom) {
      queryParams.period = '5y';
    }

    const query = new URLSearchParams(queryParams).toString();
    // 최초 로드 시: /api/users/me/likes?page=1&period=5y
    // 필터 클릭 시: /api/users/me/likes?page=1&period=12m
    const url = `/api/users/me/likes?${query}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("서버 응답 오류:", errorData || response.statusText);
        throw new Error(errorData?.message || '서버에서 데이터를 가져오는 데 실패했습니다.');
      }

      const data = await response.json();

      if (data.result && data.result.myLikes) {
        const normalizedPosts = data.result.myLikes.map(post => ({
          ...post,
          looktoday_id: post.looktoday_id || post.look_id,
          imageUrl: post.imageUrl || post.image_url,
          likeCount: post.likeCount !== undefined ? post.likeCount : post.like_count,
          nickname: post.nickname || post.User?.nickname,
          si: post.si || '',
          gungu: post.gungu || post.location || '',
          temperature: post.temperature,
        }));

        setPosts(normalizedPosts);
        setTotalPosts(data.result.pagination.totalPosts || 0);
        setTotalPages(data.result.pagination.totalPages || 1);
        setCurrentPage(data.result.pagination.page || 1);

        // UI 필터 상태 동기화
        const filterType = data.result.filter?.type;
        const filterValue = data.result.filter?.value;
        if (filterType === 'period') {
          // '5y'는 null (기본 상태)로 처리
          setActiveFilter(filterValue === '5y' ? null : filterValue);
          setStartDate(''); // 프리셋 필터 클릭 시 날짜 초기화
          setEndDate('');
        } else if (filterType === 'range') {
          setActiveFilter('custom');
          const [from, to] = filterValue.split('~');
          setStartDate(from);
          setEndDate(to);
        }

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

  // 최초 렌더링 시 데이터 로드 (페이지 1, 기본 필터 '5y' - params 안 보냄)
  useEffect(() => {
    fetchMyHearts({ page: 1 });
  }, [fetchMyHearts]);

  // --- 이벤트 핸들러 ---

  // 프리셋 필터 클릭 핸들러
  const handlePresetFilterClick = (filter) => {
    if (activeFilter === filter) {
      // 필터 해제 -> 기본(5y)으로
      setActiveFilter(null);
      setStartDate(''); setEndDate('');
      fetchMyHearts({ page: 1 }); // 'period' 파라미터 없이 요청
    } else {
      // 새 필터 적용
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

    setActiveFilter('custom'); // 'custom' 상태로 설정

    fetchMyHearts({
      period: '12m',
      dateFrom: startDate,
      dateTo: endDate,
      page: 1
    });
  };

  // 페이지네이션 페이지 변경 핸들러
  const handlePageChange = (page) => {
    const params = { page };

    if (activeFilter === 'custom' && startDate && endDate) {
      // '기간 선택' 상태일 때
      params.period = '12m';
      params.dateFrom = startDate;
      params.dateTo = endDate;
    } else if (activeFilter) {
      // '12m', 'last-month' 등 프리셋 필터 상태일 때
      params.period = activeFilter;
    }

    fetchMyHearts(params);
  };

  // 좋아요 취소 핸들러
  const handleLikeToggle = async (lookId, currentIsLiked) => {

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 좋아요 '취소' API만 호출
    const result = await toggleLikeApi(lookId, token);

    if (result.code === "LIKE200") {
      // 성공적으로 좋아요가 취소되면 화면에서 해당 게시물을 즉시 제거
      setPosts(prevPosts => prevPosts.filter(post => post.looktoday_id !== lookId));
      setTotalPosts(prevTotal => prevTotal - 1);

      // 팝업이 열려있다면 팝업 닫기
      if (isPopupOpen && selectedLook?.looktoday_id === lookId) {
        handleClosePopup();
      }

      alert("좋아요가 취소되었습니다.");

    } else {
      alert(result.message || "요청에 실패했습니다.");
    }
  };

  // 상세 팝업 열기 핸들러
  const handleOpenPopup = async (post) => {
    // post 객체는 LookCard에서 클릭된, 이미 '정규화된' 데이터입니다.
    setLoadingPopup(true);
    setSelectedLook({ ...post, isLiked: true });
    setIsPopupOpen(true);

    const token = localStorage.getItem("token");
    try {
      // 상세 정보 API 호출
      const response = await fetch(`/api/looks/${post.looktoday_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.result) {
        const detailedData = data.result;

        // 기존 post 정보(likeCount 등)와 상세 API 정보(comment 등)를 병합
        const transformedLook = {
          ...post, // LookCard에서 받은 정규화된 기본 정보
          ...detailedData, // 상세 API에서 받은 추가 정보

          // LookPopup이 기대하는 최종 구조로 덮어쓰기
          User: { nickname: detailedData.nickname },
          Image: { imageUrl: detailedData.imageUrl },
          si: '',
          gungu: detailedData.location,
          like_count: post.likeCount,
          looktoday_id: post.looktoday_id,
          isLiked: true
        };
        setSelectedLook(transformedLook);
      } else {
        throw new Error(data.message || '상세 정보를 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error("상세 정보 로딩 중 오류:", error);
      alert("상세 정보를 불러오는 데 실패했습니다.");
      // 상세 정보 로딩 실패 시, 팝업은 닫지 않고 기본 정보(post)로 유지
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
          <button
            className={`filter-btn-search${startDate && endDate ? ' active' : ''}`}
            disabled={!(startDate && endDate)}
            onClick={handleSearch}
          >
            조회
          </button>
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
                  // '정규화된' 데이터 사용
                  image={post.imageUrl}
                  locationTemp={`${post.si} ${post.gungu} · ${post.temperature ?? '-'}℃`}
                  nickname={post.nickname}
                  likeCount={post.likeCount}
                  isLiked={true} // MyHeart 페이지에서는 항상 true
                  onLikeToggle={(newLikedState) => handleLikeToggle(post.looktoday_id, !newLikedState)} // newLikedState는 항상 false가 됨
                />
              </div>
            ))
          ) : (
            <div className="myheart-empty-message">
              좋아요를 누른 게시물이 없습니다.
            </div>
          )}
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
        isMyFeed={true} // 팝업 내 하트 버튼 숨김 (MyHeart 페이지이므로)
        isLiked={selectedLook?.isLiked} // 항상 true여야 함
        onLikeToggle={handleLikeToggle}
      />
    </>
  );
};

export default MyHeart;