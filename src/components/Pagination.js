import { useState } from 'react';
import '../styles/Pagination.css';
import arrow from '../assets/images/pagination-arrow.png';

const Pagination = ({ currentPage, onPageChange }) => {
    const [startPage, setStartPage] = useState(1);

    const handlePageClick = (page) => {
        onPageChange(page); // 부모 컴포넌트에 선택된 페이지 전달
    };

    const handlePrevClick = () => {
        if (startPage > 1) {
            const newStart = Math.max(startPage - 5, 1);
            setStartPage(newStart);
            onPageChange(newStart);
        }
    };

    const handleNextClick = () => {
        const newStart = startPage + 5;
        setStartPage(newStart);
        onPageChange(newStart);
    };

    return (
        <div className='pagination'>
            {/* 왼쪽 화살표 */}
            <img
                src={arrow}
                alt='pagination-left-arrow'
                onClick={handlePrevClick}
                className={`pagination-left-arrow ${startPage === 1 ? 'disabled' : ''}`} 
            />
            
            {/* 페이지 번호 5개 */}
            {[...Array(5)].map((_, i) => {
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

            {/* 오른쪽 화살표 */}
            <img
                src={arrow}
                alt='pagination-right-arrow'
                onClick={handleNextClick}
                className='pagination-right-arrow'
            />
        </div>
    );
};

export default Pagination;