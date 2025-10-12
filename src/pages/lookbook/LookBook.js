import { useState, useEffect, useCallback } from 'react';
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
    const res = await fetch(`/api/looks/${lookId}/like`, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return await res.json();
}

const LookBook = () => {
    const [filters, setFilters] = useState([]);
    const [selectedSort, setSelectedSort] = useState('최신순');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bestLookList, setBestLookList] = useState([]);
    const [lookList, setLookList] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedLook, setSelectedLook] = useState(null);
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterState, setFilterState] = useState({
        region: null,
        startDate: null,
        endDate: null,
        weather: null
    });

    const fetchLookList = useCallback(async (page = 1) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('토큰이 없습니다. 요청 중단');
            return;
        }

        const currentFilters = filterState;
        const sortOption = selectedSort;

        let url = sortOption === '최신순'
            ? `/api/looks?sort=latest`
            : `/api/looks?sort=popular`;

        url += `&page=${page}&limit=20`;

        if (currentFilters.region?.si && currentFilters.region?.gungu) {
            url += `&si=${encodeURIComponent(currentFilters.region.si)}&gungu=${encodeURIComponent(currentFilters.region.gungu)}`;
        }
        if (currentFilters.startDate && currentFilters.endDate) {
            const start = new Date(currentFilters.startDate).toISOString().slice(0, 10);
            const end = new Date(currentFilters.endDate).toISOString().slice(0, 10);
            url += `&startDate=${start}&endDate=${end}`;
        }
        if (currentFilters.weather?.type === 'custom') {
            url += `&weather=custom&minTemp=${currentFilters.weather.min}&maxTemp=${currentFilters.weather.max}`;
        } else if (currentFilters.weather?.label) {
            url += `&weather=${encodeURIComponent(currentFilters.weather.label)}`;
        }

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            setLookList(data?.result?.looks || []);
        } catch (error) {
            console.error('fetchLookList 요청 오류:', error);
        }
    }, [filterState, selectedSort]); // 필터나 정렬 상태가 바뀌면 함수를 새로 만듭니다.

    const handleBestLook = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('/api/looks/best', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.code === 'COMMON200') {
                setBestLookList(data.result);
            } else {
                setBestLookList([]);
            }
        } catch (error) {
            console.error('Error fetching best looks:', error);
        }
    }, []);

    useEffect(() => {
        handleBestLook();
        fetchLookList(currentPage);
    }, [handleBestLook, fetchLookList, currentPage]);

    const handleLikeToggle = async (lookId, newLikedState) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인 후 이용 가능합니다.");
            return;
        }
        const result = await toggleLikeApi(lookId, token, newLikedState);
        if (result.code === "LIKE201" || result.code === "LIKE200") {
            const serverIsLiked = result.result.isLiked;
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

    const handleRemoveFilter = (indexToRemove) => {
        const removedFilterLabel = filters[indexToRemove];
        const updatedFilters = filters.filter((_, idx) => idx !== indexToRemove);
        setFilters(updatedFilters);

        const newFilterState = { ...filterState };
        if (removedFilterLabel.includes('시') || removedFilterLabel.includes('구')) {
            newFilterState.region = null;
        }
        if (removedFilterLabel.includes('~')) { // 날짜 필터 식별
            newFilterState.startDate = null;
            newFilterState.endDate = null;
        }
        if (removedFilterLabel === filterState.weather?.label) {
            newFilterState.weather = null;
        }
        setFilterState(newFilterState);
        setCurrentPage(1); // 필터 변경 시 1페이지로
    };

    const handleSortChange = (value) => {
        setSelectedSort(value);
        setCurrentPage(1); // 정렬 변경 시 1페이지로
    };

    const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 4, 0));
    const handleNext = () => setCurrentIndex((prev) => Math.min(prev + 4, bestLookList.length - 4));
    const visibleItems = bestLookList.slice(currentIndex, currentIndex + 4);

    const handleFilterApply = (appliedFilters) => {
        const startDate = appliedFilters.startDate ? new Date(appliedFilters.startDate) : null;
        const endDate = appliedFilters.endDate ? new Date(appliedFilters.endDate) : null;
        setFilterState({
            region: appliedFilters.region,
            startDate,
            endDate,
            weather: appliedFilters.weather || null,
        });

        const newUiFilters = [];
        if (appliedFilters.region?.si && appliedFilters.region?.gungu) {
            newUiFilters.push(`${appliedFilters.region.si} ${appliedFilters.region.gungu}`);
        }
        if (startDate && endDate) {
            const formatDate = (date) => date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
            newUiFilters.push(`${formatDate(startDate)} ~ ${formatDate(endDate)}`);
        }
        if (appliedFilters.weather?.label) {
            newUiFilters.push(appliedFilters.weather.label);
        }
        setFilters(newUiFilters);
        setCurrentPage(1); // 필터 적용 시 1페이지로
    };
    
    const handleOpenPopup = (look) => {
        setSelectedLook(look);
        setIsPopupOpen(true);
    };
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedLook(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="lookbook-wrap">
            <Menu />
            <div className="lookbook">
                <div className="lookbook-title">Find Your Style</div>

                <div className="lookbook-best">
                    <div className="lookbook-name">Best 10</div>
                    <div className="lookbook-best-looks">
                        <img src={arrow} alt="왼쪽 화살표" className={`lookbook-left-arrow ${currentIndex === 0 ? 'disabled' : ''}`} onClick={handlePrev} />
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
                        <img src={arrow} alt="오른쪽 화살표" className={`lookbook-right-arrow ${currentIndex + 4 >= bestLookList.length ? 'disabled' : ''}`} onClick={handleNext} />
                    </div>
                </div>

                <div className='lookbook-filter'>
                    <SearchFilter onApply={handleFilterApply} />
                </div>
                {isFilterPopupOpen && (
                    <FilterPopup onApply={handleFilterApply} onClose={() => setIsFilterPopupOpen(false)} />
                )}

                <div className="lookbook-filtered">
                    <SearchFiltered filters={filters} onRemove={handleRemoveFilter} />
                </div>

                <hr />

                <div className="lookbook-sort">
                    <SortOptions selectedSort={selectedSort} onChange={handleSortChange} />
                </div>

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

                <div className="lookbook-pagination">
                    <Pagination
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <ScrollButton />
            <Footer />

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