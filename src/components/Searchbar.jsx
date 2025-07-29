import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const SearchBar = ({ onSearch, onFilterClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null); // Mantém o foco no input

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (onSearch) onSearch(searchTerm);
    }, 500); // Pequeno atraso para evitar re-renders desnecessários

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, onSearch]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Mantém o foco no input após re-render
    }
  }, []);

  return (
    <div className="flex items-center justify-center w-full max-w-3xl gap-3 mb-6 px-4">
      <div className="relative w-full">
        <i className="pi pi-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
        <input
          ref={inputRef} // Aplica o ref no input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquise por um produto..."
          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg shadow-md"
        />
      </div>

      <button className="bg-withe p-3 rounded-lg" onClick={onFilterClick}>
        <i className="pi pi-filter"></i>
      </button>
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired, 
  onFilterClick: PropTypes.func.isRequired,
};

export default SearchBar;
