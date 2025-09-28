import { useState, useEffect } from 'react';
import Menu from '../../components/Menu';
import SearchFilter from '../../components/SearchFilter';
import SearchFiltered from '../../components/SearchFiltered';
import SortOptions from '../../components/SortOptions';
import Pagination from '../../components/Pagination';
import ScrollButton from '../../components/ScrollButton';
import Footer from '../../components/Footer';
import LookCard from '../../components/LookCard';
import BestLookCard from '../../components/BestLookCard';
import LookPopup from './LookPopup';
import FilterPopup from './FilterPopup';

import '../../styles/LookBook.css';

import arrow from '../../assets/images/pagination-arrow.png';
import lookbook from '../../assets/images/lookbook-empty.png';

async function toggleLikeApi(lookId, token, isLiked) {
    const method = isLiked ? 'POST' : 'DELETE';
    const res = await fetch(`https://looktoday.kr/api/looks/${lookId}/like`, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return await res.json();
}

const LookBook = () => {
    const [filters, setFilters] = useState([]);
    const [selectedSort, setSelectedSort] = useState('최신순'); // 최신순 or 인기순
    const [currentIndex, setCurrentIndex] = useState(0); // Best 10 슬라이드
    const [bestLookList, setBestLookList] = useState([]);
    const [lookList, setLookList] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedLook, setSelectedLook] = useState(null);
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null); // 필터에서 선택된 지역값 저장
    const [currentPage, setCurrentPage] = useState(1);

    /** 필터 태그 삭제 */
    const handleLikeToggle = async (lookId, newLikedState) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }

        const result = await toggleLikeApi(lookId, token, newLikedState);

        if (result.code === "LIKE201" || result.code === "LIKE200") {
            
            const serverIsLiked = result.result.isLiked; // 서버가 보내준 최종 isLiked 상태

            const updateStateWithServerData = (list) =>
                list.map(look => {
                    if (look.looktoday_id === lookId) {
                        return {
                            ...look,
                            isLiked: serverIsLiked,
                            like_count: newLikedState ? look.like_count + 1 : Math.max(0, look.like_count - 1),
                        };
                    }
                    return look;
                });

            setLookList(prevList => updateStateWithServerData(prevList));
            setBestLookList(prevList => updateStateWithServerData(prevList));

            if (selectedLook && selectedLook.looktoday_id === lookId) {
                setSelectedLook(prevLook => ({
                    ...prevLook,
                    isLiked: serverIsLiked,
                    like_count: newLikedState ? prevLook.like_count + 1 : Math.max(0, prevLook.like_count - 1),
                }));
            }

        } else if (result.code === "LIKE409" || result.code === "LIKE404") {
            alert("데이터 상태가 일치하지 않아 목록을 새로고침합니다.");
            fetchLookList(); 
            handleBestLook();

        } else {
            alert(result.message || "요청에 실패했습니다.");
        }
    };

    // 적용된 필터 삭제
    const handleRemoveFilter = (indexToRemove) => {
        const updatedFilters = filters.filter((_, idx) => idx !== indexToRemove);
        setFilters(updatedFilters);

        let region = null;
        let startDate = null;
        let endDate = null;

        updatedFilters.forEach(filter => {
            if (filter.includes('시') || filter.includes('구')) {
                const parts = filter.split(' ');
                region = { si: parts[0], gungu: parts[1] };
            }

            if (filter.includes('년') && filter.includes('월') && filter.includes('~')) {
                const [start, end] = filter.split(' ~ ');
                startDate = new Date(start);
                endDate = new Date(end);
            }
        });

        fetchLookList(region, startDate, endDate);
    };


    /** 정렬(최신순/인기순) 변경 */
    const handleSortChange = (value) => {
        setSelectedSort(value);
    };

    /** Best 10 데이터 가져오기 */
    const handleBestLook = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('토큰이 없습니다. Best Look 요청 중단');
            return;
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch('/api/looks/best', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ 토큰 추가
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            console.log('Best Look data:', data);
                method: "GET",
                headers: headers,
            });

            const data = await res.json();
            console.log("best looks data", data); // 데이터 확인용 로그

            // 서버에서 에러 응답이 오면 setBestLookList 실행하지 않음
            if (data.code === 'COMMON200') {
                setBestLookList(data.result);
            } else {
                console.error('Best Look 요청 실패:', data.message);
                setBestLookList([]); // 안전하게 초기화
            }
        } catch (error) {
            console.error('Error fetching best looks:', error);
        }
    };

    const fetchLookListWithToken = async (page = 1) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('토큰이 없습니다. 요청 중단');
            return;
        }

        try {
            const url = `/api/looks?page=${page}&limit=20`;
            console.log("페이지네이션 요청 URL:", url);

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            console.log('페이지네이션 응답:', data);

            // 데이터 구조에 따라 lookList 업데이트
            setLookList(data?.result?.looks || []);
        } catch (error) {
            console.error('페이지네이션 요청 오류:', error);
        }
    };

    useEffect(() => {
        handleBestLook();
    }, []);

    /** Best 10 화살표 */
    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(prev - 4, 0));
    };
    const handleNext = () => {
        setCurrentIndex((prev) =>
            Math.min(prev + 4, bestLookList.length - 4)
        );
    };

    const visibleItems = bestLookList.slice(currentIndex, currentIndex + 4);

    /** 메인 룩 리스트 가져오기 (정렬 + 지역 필터) */
    const fetchLookList = async (
        region = null,
        startDate = null,
        endDate = null,
        weather = null,
        page = 1,
        limit = 20
    ) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('토큰이 없습니다. 요청 중단');
            return;
        }

        let url = selectedSort === '최신순'
            ? `/api/looks?sort=latest`
            : `/api/looks?sort=popular`;

        url += `&page=${page}&limit=${limit}`;

        // ✅ 필터 관련 파라미터 추가
        if (region?.si && region?.gungu) {
            url += `&si=${encodeURIComponent(region.si)}&gungu=${encodeURIComponent(region.gungu)}`;
        }

        if (startDate && endDate) {
            const start = startDate.toISOString().slice(0, 10);
            const end = endDate.toISOString().slice(0, 10);
            url += `&startDate=${start}&endDate=${end}`;
        }

        if (weather?.type === 'custom') {
            url += `&weather=custom&minTemp=${weather.min}&maxTemp=${weather.max}`;
        } else if (weather?.label) {
            url += `&weather=${encodeURIComponent(weather.label)}`;
        }

        console.log("최종 요청 URL:", url);

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ 토큰 추가
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            console.log("서버 응답:", data);

    const fetchLookList = async () => {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch('/api/looks', {
                method: "GET",
                headers: headers,
            });

            const data = await res.json();
            console.log("look list data", data); // 데이터 확인용 로그

            setLookList(data?.result?.looks || []);
        } catch (error) {
            console.error('fetchLookList 요청 오류:', error);
        }
    };

    /** 첫 렌더링 시 기본 리스트 가져오기 */
    useEffect(() => {
        fetchLookList(selectedRegion);

        handleBestLook();
        fetchLookList();
    }, []);

    /** 정렬 변경 시 다시 fetch */
    useEffect(() => {
        fetchLookList(selectedRegion);
    }, [selectedSort]);

    useEffect(() => {
        console.log("현재 lookList 상태:", lookList); // ✅ 상태 변화 감지
    }, [lookList]);

    /** 필터 적용 시 실행 */
    const handleFilterApply = (appliedFilters) => {
        console.log("[LookBook] FilterPopup에서 받은 filters:", appliedFilters);

        const newFilters = [];

        // 날짜 값이 있을 때만 Date 객체 생성
        const startDate = appliedFilters.startDate ? new Date(appliedFilters.startDate) : null;
        const endDate = appliedFilters.endDate ? new Date(appliedFilters.endDate) : null;

        const formatDate = (date) =>
            date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        // 지역 필터
        if (appliedFilters.region?.si && appliedFilters.region?.gungu) {
            newFilters.push(`${appliedFilters.region.si} ${appliedFilters.region.gungu}`);
        }

        // 날짜 필터 (값이 있을 때만 추가)
        if (startDate && endDate) {
            newFilters.push(`${formatDate(startDate)} ~ ${formatDate(endDate)}`);
        }

        setFilters(newFilters);

        // 서버 데이터 갱신
        fetchLookList(appliedFilters.region, startDate, endDate);
    };

    /** 팝업 열기/닫기 */
    const handleOpenPopup = (look) => {
        setSelectedLook(look);
        setIsPopupOpen(true);
    };
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedLook(null);
    };

    return (
        <div className="lookbook-wrap">
            <Menu />
            <div className="lookbook">
                <div className="lookbook-title">Find Your Style</div>

                {/* Best 10 영역 */}
                <div className="lookbook-best">
                    <div className="lookbook-name">Best 10</div>
                    <div className="lookbook-best-looks">
                        <img
                            src={arrow}
                            alt="왼쪽 화살표"
                            className={`lookbook-left-arrow ${currentIndex === 0 ? 'disabled' : ''}`}
                            onClick={handlePrev}
                        />
                        <div className="best-look-cards">
                            {visibleItems.map((item, index) => (
                                <div key={item.looktoday_id} onClick={() => handleOpenPopup(item)}>
                                    <BestLookCard
                                        rank={currentIndex + index + 1}
                                        image={item.Image?.imageUrl || lookbook}
                                        temperature={item.temperature ?? '-'}
                                        location={`${item.si} ${item.gungu}`}
                                        nickname={item.User.nickname}
                                        likeCount={item.like_count}
                                    />
                                </div>
                            ))}
                        </div>
                        <img
                            src={arrow}
                            alt="오른쪽 화살표"
                            className={`lookbook-right-arrow ${currentIndex + 4 >= bestLookList.length ? 'disabled' : ''}`}
                            onClick={handleNext}
                        />
                    </div>
                </div>

                {/* 필터 */}
                <div className='lookbook-filter'>
                    <SearchFilter onApply={handleFilterApply} />
                </div>
                {isFilterPopupOpen && (
                    <FilterPopup
                        onApply={(filters) => {
                            console.log("[LookBook] FilterPopup에서 받은 filters:", filters);
                            fetchLookList(filters.region);
                        }}
                        onClose={() => setIsFilterPopupOpen(false)}
                    />
                )}

                {/* 적용된 필터 표시 */}
                <div className="lookbook-filtered">
                    <SearchFiltered filters={filters} onRemove={handleRemoveFilter} />
                </div>

                <hr />

                {/* 정렬 옵션 */}
                <div className="lookbook-sort">
                    <SortOptions selectedSort={selectedSort} onChange={handleSortChange} />
                </div>

                {/* 룩 리스트 */}
                <div className="lookbook-outfits">
                    <div className="look-cards">
                        {lookList.length === 0 ? (
                            <div>룩 데이터가 없습니다.</div>
                        ) : (
                            lookList.map((item) => (
                                <div key={item.looktoday_id} onClick={() => handleOpenPopup(item)}>
                                    <LookCard
                                        lookId={item.looktoday_id}
                                        image={item.Image?.imageUrl || lookbook}
                                        locationTemp={`${item.si} ${item.gungu} · ${item.temperature ?? '-'}℃`}
                                        nickname={item.User?.nickname || '닉네임 없음'}
                                        likeCount={item.like_count}
                                        isLiked={item.isLiked}
                                        onLikeToggle={(newLikedState) => handleLikeToggle(item.looktoday_id, newLikedState)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 페이지네이션 */}
                <div className="lookbook-pagination">
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            fetchLookListWithToken(page); // ✅ 토큰이 필요한 페이지네이션 요청
                        }}
                    />
                </div>
            </div>

            <ScrollButton />
            <Footer />

            {/* 상세 팝업 */}
            <LookPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                look={selectedLook}
                isLiked={selectedLook?.isLiked}
                onLikeToggle={handleLikeToggle}
            />
        </div>
    );
};

export default LookBook;