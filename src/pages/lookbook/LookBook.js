import { useState } from 'react';
import Menu from '../../components/Menu';
import SearchFilter from '../../components/SearchFilter';
import SearchFiltered from '../../components/SearchFiltered';
import SortOptions from '../../components/SortOptions';
import Pagination from '../../components/Pagination';
import ScrollButton from '../../components/ScrollButton';
import Footer from '../../components/Footer';
import LookCard from '../../components/LookCard';
import BestLookCard from '../../components/BestLookCard';

import '../../styles/LookBook.css';

import arrow from '../../assets/images/pagination-arrow.png';
import lookbook from '../../assets/images/lookbook-empty.png';

const TOTAL_ITEMS = 10;
const VISIBLE_COUNT = 4;

const LookBook = () => {
    const [filters, setFilters] = useState([
        '서울시 노원구',
        '6 ~ 11°C',
        '2025년 7월 6일 ~ 2025년 8월 6일',
    ]);
    const [selectedSort, setSelectedSort] = useState('최신순');
    const [currentIndex, setCurrentIndex] = useState(0);

    // 적용된 필터 삭제
    const handleRemoveFilter = (indexToRemove) => {
        setFilters(filters.filter((_, idx) => idx !== indexToRemove));
    };

    // 최신순 인기순 정렬 선택
    const handleSortChange = (value) => {
        setSelectedSort(value);
    };

    // Best 아이템 정렬
    const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
        rank: i + 1,
        image: lookbook,
        locationTemp: '서울시 노원구 · 29℃',
        nickname: '닉네임',
        likeCount: 11,
    }));

    // Best 아이템 왼쪽 화살표 클릭시
    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(prev - VISIBLE_COUNT, 0));
    };

    // Best 아이템 오른쪽 화살표 클릭시
    const handleNext = () => {
        setCurrentIndex((prev) =>
            Math.min(prev + VISIBLE_COUNT, TOTAL_ITEMS - VISIBLE_COUNT)
        );
    };

    // BestLookCard를 4개만 잘라서 보여줌
    const visibleItems = items.slice(currentIndex, currentIndex + VISIBLE_COUNT);

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
                            {visibleItems.map((item) => (
                                <BestLookCard key={item.rank} {...item} />
                            ))}
                        </div>
                        <img
                            src={arrow}
                            alt='오른쪽 화살표'
                            className={`lookbook-right-arrow ${currentIndex + VISIBLE_COUNT >= TOTAL_ITEMS ? 'disabled' : ''
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
                        {[...Array(18)].map((_, index) => (
                            <LookCard
                                key={index}
                                image={lookbook}
                                locationTemp="서울시 노원구 · 29℃"
                                nickname="닉네임"
                                likeCount={11}
                            />
                        ))}
                    </div>
                </div>
                <div className='lookbook-pagination'>
                    <Pagination />
                </div>
            </div>
            <ScrollButton />
            <Footer />
        </div>
    );
};

export default LookBook;
