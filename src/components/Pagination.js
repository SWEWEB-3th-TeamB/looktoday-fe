import { useState } from 'react';

import '../styles/Pagination.css';

import arrow from '../assets/images/pagination-arrow.png'

const Pagination = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [startPage, setStartPage] = useState(1);

    const handlePageClick = (page) => {
        setCurrentPage(page);
    }

    const handlePrevClick = () => {
        if (startPage > 1) {
            setStartPage((prev) => {
                const newStart = Math.max(prev - 5, 1);
                setCurrentPage(newStart);
                return newStart;
            });
        }
    }

    const handleNextClick = () => {
        setStartPage((prev) => {
            const newStart = prev + 5;
            setCurrentPage(newStart);
            return newStart;
        });
    }

    return (
        <div className='pagination'>
            <img
                src={arrow}
                alt='pagination-left-arrow'
                onClick={handlePrevClick}
                className={`pagination-left-arrow ${startPage === 1 ? 'disabled' : ''}`} // 시작이 1이면 disabled
            />
            {[...Array(5)].map((_, i) => { // 5의 크기, map, i=index, page는 1부터 시작이므로 startPage 더함
                const page = startPage + i;
                return (
                    <div
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageClick(page)}
                    >
                        {page}
                    </div>
                );
            })}

            <img
                src={arrow}
                alt='pagination-right-arrow'
                onClick={handleNextClick}
                className='pagination-right-arrow'
            />
        </div>
    );
}

export default Pagination;