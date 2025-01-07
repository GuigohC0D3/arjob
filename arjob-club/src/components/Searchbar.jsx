import { useState } from "react";
import PropTypes from "prop-types";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="searchbar-container flex items-center justify-center mt-4">
      <div className="relative w-full max-w-lg">
        <span className="p-input-icon-left w-full">
          <i
            className="pi pi-search text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          ></i>
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full p-3 pl-10 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </span>
      </div>
    </div>
  );
};

// Definir PropTypes corretamente
SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired, // Apenas 'onSearch' é obrigatório
};

export default SearchBar;
