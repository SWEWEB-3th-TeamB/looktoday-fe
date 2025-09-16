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

import '../../styles/LookBook.css';

import arrow from '../../assets/images/pagination-arrow.png';
import lookbook from '../../assets/images/lookbook-empty.png';

const LookBook = () => {
    const [filters, setFilters] = useState([
        '서울시 노원구',
        '6 ~ 11°C',
        '2025년 7월 6일 ~ 2025년 8월 6일',
    ]);
    const [selectedSort, setSelectedSort] = useState('최신순');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bestLookList, setBestLookList] = useState([]);
    const [lookList, setLookList] = useState([]);
    const [sortedLookList, setSortedLookList] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedLook, setSelectedLook] = useState(null);

    // 적용된 필터 삭제
    const handleRemoveFilter = (indexToRemove) => {
        setFilters(filters.filter((_, idx) => idx !== indexToRemove));
    };

    // 최신순 인기순 정렬 선택
    const handleSortChange = (value) => {
        setSelectedSort(value);
    };

    const handleBestLook = async () => {
        try {
            const res = await fetch('http://43.203.195.97:3000/api/looks/best', {
                method: "GET",
            });

            const data = await res.json();
            console.log("data", data);
            console.log("message", data.message);

            setBestLookList(data.result);

        } catch (error) {
            console.error("Error fetching best looks:", error);
        }
    }

    useEffect(() => {
        handleBestLook();
    }, []);

    // Best 아이템 왼쪽 화살표 클릭시
    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(prev - 4, 0));
    };

    // Best 아이템 오른쪽 화살표 클릭시
    const handleNext = () => {
        setCurrentIndex((prev) =>
            Math.min(prev + 4, bestLookList.length - 4)
        );
    };

    // BestLookCard를 4개만 잘라서 보여줌
    const visibleItems = bestLookList.slice(currentIndex, currentIndex + 4);

    const fetchLookList = async () => {
        try {
            const res = await fetch('http://43.203.195.97:3000/api/looks', {
                method: "GET",
            });

            const data = await res.json();
            console.log("look data", data);

            setLookList(data.result.looks);
        } catch (error) {
            console.error("Error fetching looks:", error);
        }
    };

    useEffect(() => {
        fetchLookList();
    }, []);

    useEffect(() => {
        if (lookList.length === 0) return;

        const sorted = [...lookList].sort((a, b) => {
            if (selectedSort === '최신순') {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            } else {
                return b.like_count - a.like_count;
            }
        });

        setSortedLookList(sorted);
    }, [selectedSort, lookList]);

    // 팝업 열기
    const handleOpenPopup = (look) => {
        setSelectedLook(look);
        setIsPopupOpen(true);
    };

    // 팝업 닫기
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedLook(null);
    };

    return (
        <div className="lookbook-wrap">
            <Menu />
            <div className='lookbook'>
                <div className='lookbook-title'>Find Your Style</div>
                <div className='lookbook-best'>
                    <div className='lookbook-name'>Best 10</div>
                    <div className='lookbook-best-looks'>
                        <img
                            src={arrow}
                            alt='왼쪽 화살표'
                            className={`lookbook-left-arrow ${currentIndex === 0 ? 'disabled' : ''}`}
                            onClick={handlePrev}
                        />
                        <div className='best-look-cards'>
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
                            alt='오른쪽 화살표'
                            className={`lookbook-right-arrow ${currentIndex + 4 >= bestLookList.length ? 'disabled' : ''
                                }`}
                            onClick={handleNext}
                        />
                    </div>
                </div>
                <div className='lookbook-filter'>
                    <SearchFilter />
                </div>
                <div className='lookbook-filtered'>
                    <SearchFiltered filters={filters} onRemove={handleRemoveFilter} />
                </div>
                <hr />
                <div className='lookbook-sort'>
                    <SortOptions selectedSort={selectedSort} onChange={handleSortChange} />
                </div>
                <div className='lookbook-outfits'>
                    <div className='look-cards'>
                        {sortedLookList.length === 0 ? (
                            <div>룩 데이터가 없습니다.</div>
                        ) : (
                            sortedLookList.map((item) => (
                                <div key={item.looktoday_id} onClick={() => handleOpenPopup(item)}>
                                    <LookCard
                                        lookId={item.looktoday_id}
                                        image={item.Image?.imageUrl || lookbook}
                                        locationTemp={`${item.si} ${item.gungu} · ${item.temperature ?? '-'}℃`}
                                        nickname={item.User.nickname}
                                        likeCount={item.like_count}
                                        initiallyLiked={false}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className='lookbook-pagination'>
                    <Pagination />
                </div>
            </div>
            <ScrollButton />
            <Footer />

            <LookPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                look={selectedLook}
            />
        </div>
    );
};

export default LookBook;
