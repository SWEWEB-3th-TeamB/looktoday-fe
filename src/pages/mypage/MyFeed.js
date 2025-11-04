import { useState, useEffect, useCallback } from 'react';

import Menu from '../../components/Menu';
import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/Calendar';
import LookCard from '../../components/LookCard';
import Pagination from '../../components/Pagination';
import Footer from '../../components/Footer';
import LookPopup from '../lookbook/LookPopup';
import MyFeedCardOption from '../../components/MyFeedCardOption';
import lookbookEmpty from '../../assets/images/lookbook-empty.png';

import '../../styles/MyFeed.css';

async function toggleLikeApi(lookId, token, isLiked) {
    const method = isLiked ? 'POST' : 'DELETE';
    const res = await fetch(`/api/looks/${lookId}/like`, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return await res.json();
}

const MyFeed = () => {
    const [activeFilter, setActiveFilter] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [posts, setPosts] = useState([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedLook, setSelectedLook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPopup, setLoadingPopup] = useState(false);

    const handleLikeToggle = async (lookId, newLikedState) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        const originalPosts = [...posts]; // 롤백을 위한 원본 데이터 저장

        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.looktoday_id === lookId) {
                    return {
                        ...post,
                        isLiked: newLikedState,
                        likeCount: newLikedState ? post.likeCount + 1 : post.likeCount - 1,
                    };
                }
                return post;
            })
        );
        // 팝업이 열려있다면 팝업 내부 데이터도 업데이트
        if (selectedLook && selectedLook.looktoday_id === lookId) {
            setSelectedLook(prevLook => ({
                ...prevLook,
                isLiked: newLikedState,
                // 팝업은 like_count를 사용하므로 둘 다 업데이트
                like_count: newLikedState ? prevLook.like_count + 1 : prevLook.like_count - 1, 
                likeCount: newLikedState ? prevLook.likeCount + 1 : prevLook.likeCount - 1,
            }));
        }
        
        // 서버에 API 요청
        const result = await toggleLikeApi(lookId, token, newLikedState);
        if (!result.success && result.code !== 'LIKE200') { 
            alert(result.message || "요청에 실패했습니다.");
            setPosts(originalPosts); // 서버 실패 시 원래 상태로 복구
            // 팝업 상태도 롤백
            if (selectedLook && selectedLook.looktoday_id === lookId) {
                const originalPost = originalPosts.find(p => p.looktoday_id === lookId);
                handleOpenPopup(originalPost); // 팝업 데이터를 원본으로 복구
            }
        }
    };

    const fetchMyFeeds = useCallback(async (params = {}) => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) { setLoading(false); return; }

        const query = new URLSearchParams(params).toString();
        const url = `/api/users/me/feeds?${query}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('서버에서 데이터를 가져오는 데 실패했습니다.');

            const data = await response.json();
            
            if (data.result && data.result.myLooks) {
                // 데이터 형식을 내부에서 사용하는 camelCase로 통일
                const normalizedPosts = data.result.myLooks.map(post => ({
                    ...post,
                    likeCount: post.like_count !== undefined ? post.like_count : post.likeCount,
                    isLiked: post.is_liked !== undefined ? post.is_liked : post.isLiked,
                }));
                setPosts(normalizedPosts);
                setTotalPosts(data.result.pagination.totalPosts || 0);
                setTotalPages(data.result.pagination.totalPages || 1);
                setCurrentPage(data.result.pagination.page || 1);
            } else {
                setPosts([]); setTotalPosts(0); setTotalPages(1);
            }
        } catch (error) {
            console.error("피드 로딩 중 오류:", error);
            setPosts([]); setTotalPosts(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyFeeds({ page: 1 });
    }, [fetchMyFeeds]);

    const handlePresetFilterClick = (filter) => {
        if (activeFilter === filter) {
            setActiveFilter(null);
            setStartDate(''); setEndDate('');
            fetchMyFeeds({ page: 1 });
        } else {
            setActiveFilter(filter);
            setStartDate(''); setEndDate('');
            fetchMyFeeds({ period: filter, page: 1 });
        }
    };

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
        fetchMyFeeds({ dateFrom: startDate, dateTo: endDate, page: 1 });
    };

    const handlePageChange = (page) => {
        const params = { page };
        if (activeFilter && activeFilter !== 'custom') {
            params.period = activeFilter;
        } else if (startDate && endDate) {
            params.dateFrom = startDate;
            params.dateTo = endDate;
        }
        fetchMyFeeds(params);
    };

    const handleDeleteSuccess = (deletedId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.looktoday_id !== deletedId));
        setTotalPosts(prevTotal => prevTotal - 1);
    };

    const handleOpenPopup = async (post) => {
        // 팝업을 즉시 열고 로딩 상태로 설정
        setSelectedLook(post); 
        setIsPopupOpen(true);
        setLoadingPopup(true);

        const token = localStorage.getItem("token");
        try {
            // 상세 정보 API 호출
            const response = await fetch(`/api/looks/${post.looktoday_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('상세 정보 로딩 실패');
            
            const data = await response.json();
            
            if (data.result) {
                const detailedData = data.result;
                
                // (기존 list의 isLiked, likeCount와 상세 API의 닉네임/날짜를 조합)
                setSelectedLook(prevState => ({
                    ...prevState, // 'posts' 배열의 post 객체 (isLiked, likeCount 포함)
                    ...detailedData, // 상세 API에서 받은 데이터 (date, comment 등)

                    // LookPopup이 기대하는 최종 구조로 덮어쓰기
                    User: { nickname: detailedData.nickname },
                    Image: { imageUrl: detailedData.imageUrl },
                    apparent_temp: detailedData.feelsLikeTemp,
                    gungu: detailedData.location,
                    si: '', // 팝업은 gungu만 사용
                    
                    like_count: prevState.likeCount 
                }));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("상세 정보 로딩 중 오류:", error);
            alert("상세 정보를 불러오는 데 실패했습니다.");
            setIsPopupOpen(false);
        } finally {
            setLoadingPopup(false); // 로딩 종료
        }
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedLook(null);
    };

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
            <div className="myfeed-wrapper">
                <div className="myfeed-container"><h1 className="myfeed-title">MY FEED</h1></div>
                <div className="myfeed-filter-bar">
                    <button className={`filter-btn-12m${activeFilter === '12m' ? ' active' : ''}`} onClick={() => handlePresetFilterClick('12m')}>최근 12개월</button>
                    <button className={`filter-btn-1m${activeFilter === 'last-month' ? ' active' : ''}`} onClick={() => handlePresetFilterClick('last-month')}>{prev1Month}월</button>
                    <button className={`filter-btn-2m${activeFilter === 'two-months-ago' ? ' active' : ''}`} onClick={() => handlePresetFilterClick('two-months-ago')}>{prev2Month}월</button>
                    <div className="filter-calendar-start"><Calendar value={startDate} onChange={handleStartDateChange} /></div>
                    <span className="filter-tilde">~</span>
                    <div className="filter-calendar-end"><Calendar value={endDate} onChange={handleEndDateChange} /></div>
                    <button className={`filter-btn-search${startDate && endDate ? ' active' : ''}`} disabled={!(startDate && endDate)} onClick={handleSearch}>조회</button>
                </div>
                <div className="myfeed-guide-text">최대 12개월 단위로 조회 가능하며, 최근 5년간의 게시물을 조회하실 수 있습니다.</div>
                <div className="myfeed-hr-container"><hr className="myfeed-hr" /><span className="myfeed-count-text">총 {totalPosts}건</span></div>
                <div className="myfeed-cards">
                    {loading ? (<div>로딩 중...</div>) : posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.looktoday_id} className="myfeed-card-with-option" onClick={() => handleOpenPopup(post)}>
                                <LookCard
                                    lookId={post.looktoday_id}
                                    image={post.imageUrl || lookbookEmpty}
                                    locationTemp={`${post.si} ${post.gungu} · ${post.temperature ?? '-'}℃`}
                                    likeCount={post.likeCount}
                                    isLiked={post.isLiked}
                                    onLikeToggle={(newLikedState) => handleLikeToggle(post.looktoday_id, newLikedState)}
                                />
                                <div onClick={(e) => e.stopPropagation()}>
                                    <MyFeedCardOption
                                        postData={post}
                                        onDeleteSuccess={() => handleDeleteSuccess(post.looktoday_id)}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (<div>작성한 게시물이 없습니다.</div>)}
                </div>
                <div className="myfeed-pagination"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div>
            </div>
            <div className="myfeed-footer"><Footer /></div>
            <LookPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                look={selectedLook}
                isLoading={loadingPopup}
                isMyFeed={false}
                isLiked={selectedLook?.isLiked}
                onLikeToggle={handleLikeToggle}
            />
        </>
    );
};

export default MyFeed;