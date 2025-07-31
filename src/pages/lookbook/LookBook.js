import React from 'react';

import Menu from '../../components/Menu';
import SearchFilter from '../../components/SearchFilter';
import Pagination from '../../components/Pagination';
import ScrollButton from '../../components/ScrollButton';
import Footer from '../../components/Footer';

import '../../styles/LookBook.css';

const LookBook = () => {
    return (
        <div className="lookbook-wrap">
            <Menu />
            <div className='lookbook'>
                <div className='lookbook-title'>Find Your Style</div>
                <div className='lookbook-best'></div>
                <SearchFilter />
                <div className='lookbook-sort'></div>
                <div className='lookbook-outfits'></div>
                <Pagination />
            </div>
            <ScrollButton />
            <Footer />
        </div>
    );
}

export default LookBook;