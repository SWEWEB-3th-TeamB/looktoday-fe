import { useEffect } from 'react';
import '../styles/LookBook.css';

const SortOptions = ({ selectedSort, onChange }) => {
  const sortList = ['최신순', '인기순'];

  useEffect(() => {
    if (selectedSort === sortList[0]) {
      console.log('최신순 선택');
    } else if (selectedSort === sortList[1]) {
      console.log('인기순 선택');
    }
  }, [selectedSort]);

  return (
    <div className='sort-options'>
      {sortList.map((sort) => (
        <div
          key={sort}
          className={`sort-option ${selectedSort === sort ? 'active' : ''}`}
          onClick={() => onChange(sort)}
        >
          {sort}
        </div>
      ))}
    </div>
  );
};

export default SortOptions;
