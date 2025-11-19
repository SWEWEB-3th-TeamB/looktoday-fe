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

    const handleLikeToggle = async (lookId, newLikedState) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        const result = await toggleLikeApi(lookId, token, newLikedState);

        if (result.code === "LIKE201" || result.code === "LIKE200") {
            const serverIsLiked = result.result.isLiked;

            // UI 업데이트 함수
            const updateStateWithServerData = (list) =>
                list.map(post => {
                    // ID 비교 (안전하게 문자열로 변환하여 비교)
                    if (String(post.looktoday_id) === String(lookId)) {

                        // 숫자로 안전하게 변환
                        const currentCount = typeof post.likeCount === 'number'
                            ? post.likeCount
                            : parseInt(post.likeCount || 0, 10);

                        return {
                            ...post,
                            isLiked: serverIsLiked,
                            // LookBook의 카운트 계산 로직 적용
                            likeCount: newLikedState
                                ? currentCount + 1
                                : Math.max(0, currentCount - 1),
                            // 원본 데이터(snake_case)도 함께 갱신
                            like_count: newLikedState
                                ? currentCount + 1
                                : Math.max(0, currentCount - 1),
                        };
                    }
                    return post;
                });

            // 리스트 상태 업데이트
            setPosts(prevPosts => updateStateWithServerData(prevPosts));

            // 팝업이 열려있고 해당 게시물이라면 팝업 상태도 업데이트
            if (selectedLook && String(selectedLook.looktoday_id) === String(lookId)) {
                setSelectedLook(prevLook => {
                    const currentCount = typeof prevLook.likeCount === 'number'
                        ? prevLook.likeCount
                        : parseInt(prevLook.likeCount || 0, 10);

                    return {
                        ...prevLook,
                        isLiked: serverIsLiked,
                        likeCount: newLikedState
                            ? currentCount + 1
                            : Math.max(0, currentCount - 1),
                        like_count: newLikedState
                            ? currentCount + 1
                            : Math.max(0, currentCount - 1),
                    };
                });
            }

        } else if (result.code === "LIKE409" || result.code === "LIKE404") {
            alert("데이터 상태가 일치하지 않아 목록을 새로고침합니다.");
            fetchMyFeeds({ page: currentPage });
        } else {
            alert(result.message || "요청에 실패했습니다.");
        }
    };

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
        setSelectedLook(post);
        setIsPopupOpen(true);
        setLoadingPopup(true);

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/looks/${post.looktoday_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('상세 정보 로딩 실패');

            const data = await response.json();

            if (data.result) {
                const detailedData = data.result;
                setSelectedLook(prevState => ({
                    ...prevState,
                    ...detailedData,
                    User: { nickname: detailedData.nickname },
                    Image: { imageUrl: detailedData.imageUrl },
                    apparent_temp: detailedData.feelsLikeTemp,
                    gungu: detailedData.location,
                    si: '',
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
            setLoadingPopup(false);
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
        <div className='mypage'>
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
        </div>
    );
};

export default MyFeed;