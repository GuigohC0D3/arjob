import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./SearchBar.css";

const SearchBar = ({ onSearch, onFilterClick }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="searchbar-container flex items-center justify-center mt-4 gap-2">
      <div className="relative w-full max-w-lg flex items-center">
        {/* Input de pesquisa com ícone de lupa */}
        <span className="p-input-icon-left w-full">
          <i
            className="pi pi-search text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          ></i>
          <InputText
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value); // Atualiza o estado local
              if (onSearch) onSearch(e.target.value); // Chama a função de busca do pai
            }}
            placeholder="Pesquisar..."
            className="w-full p-3 pl-10 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </span>
      </div>

      {/* Botão de filtro */}
      <Button
        icon="pi pi-filter"
        className="filter-btn"
        onClick={onFilterClick} // Chama a função para abrir o filtro de categorias
        tooltip="Filtrar por categoria"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );
};

export default SearchBar;
