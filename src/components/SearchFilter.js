import '../styles/SearchFilter.css';

import arrow from '../assets/images/pagination-arrow.png'

const SearchFilter = () => {
    return (
        <div className='search-filter'>
            <div className='search-filter-item'>
                지역<img src={arrow} alt='search-filter-arrow' className='search-filter-arrow'/>
            </div>
            ㅣ
            <div className='search-filter-item'>
                날짜<img src={arrow} alt='search-filter-arrow' className='search-filter-arrow'/>
            </div>
            ㅣ
            <div className='search-filter-item'>
                날씨<img src={arrow} alt='search-filter-arrow' className='search-filter-arrow'/>
            </div>        
        </div>
    );
}

export default SearchFilter;