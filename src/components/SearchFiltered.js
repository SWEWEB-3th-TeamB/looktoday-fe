import '../styles/SearchFilter.css';

const SearchFiltered = ({ filters, onRemove }) => {
  return (
    <div className='search-filterd'>
      {filters.map((filter, index) => (
        <div key={index} className='search-filterd-item'>
          {filter}
          <div
            className='search-filterd-closed'
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