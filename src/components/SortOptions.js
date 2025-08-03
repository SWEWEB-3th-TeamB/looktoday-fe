import '../styles/LookBook.css';

const SortOptions = ({ selectedSort, onChange }) => {
  const sortList = ['최신순', '인기순'];

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
