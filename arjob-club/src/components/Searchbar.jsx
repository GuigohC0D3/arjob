import PropTypes from "prop-types";
import { InputText } from "primereact/inputtext";

const SearchBar = ({ value, onChange, onSearch, onOpenFilter }) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg shadow-lg max-w-lg">
      {/* Botão de Pesquisa */}
      <button
        onClick={onSearch}
        className="p-2 focus:outline-none hover:text-blue-400"
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "white",
        }}
        aria-label="Pesquisar"
      >
        <i className="pi pi-search text-lg"></i>
      </button>

      {/* Campo de Texto */}
      <InputText
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquisar produtos..."
        className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg p-2 focus:outline-none"
      />

      {/* Botão de Filtro */}
      <button
        onClick={onOpenFilter}
        className="p-2 focus:outline-none hover:text-blue-400"
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "white",
        }}
        aria-label="Filtrar"
      >
        <i className="pi pi-filter text-lg"></i>
      </button>
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onOpenFilter: PropTypes.func.isRequired,
};

export default SearchBar;
