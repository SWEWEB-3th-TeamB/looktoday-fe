import '../styles/SearchFilter.css';

const SearchFiltered = ({ filters, onRemove }) => {
  return (
    <div className='search-filtered'>
      {filters.map((filter, index) => (
        <div key={index} className='search-filtered-item'>
          {filter}
          <div
            className='search-filtered-closed'
            onClick={() => onRemove(index)}
          >
            X
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchFiltered;