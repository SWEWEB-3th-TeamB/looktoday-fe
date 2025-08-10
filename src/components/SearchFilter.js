import { useState } from 'react';
import '../styles/SearchFilter.css';
import arrow from '../assets/images/pagination-arrow.png';
import FilterPopup from '../pages/lookbook/FilterPopup';

const SearchFilter = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);

    const openPopup = (filterName) => {
        setSelectedFilter(filterName);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
    };

    return (
        <div>
            <div className='search-filter'>
                <div className='search-filter-item' onClick={() => openPopup('지역')}>
                    지역<img src={arrow} alt='search-filter-arrow' className='search-filter-arrow' />
                </div>
                ㅣ
                <div className='search-filter-item' onClick={() => openPopup('날씨')}>
                    날씨<img src={arrow} alt='search-filter-arrow' className='search-filter-arrow' />
                </div>
                ㅣ
                <div className='search-filter-item' onClick={() => openPopup('날짜')}>
                    날짜<img src={arrow} alt='search-filter-arrow' className='search-filter-arrow' />
                </div>
            </div>

            {isPopupOpen && <FilterPopup onClose={closePopup} defaultItem={selectedFilter} />}
        </div>
    );
};

export default SearchFilter;
