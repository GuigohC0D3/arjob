import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const SearchBar = ({ onSearch, onFilterClick }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex items-center justify-center w-full max-w-3xl gap-3 mt-6 px-4">
      {/* Input de pesquisa com ícone */}
      <div className="relative w-full">
        <i
          className="pi pi-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        ></i>
        <InputText
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
          placeholder="Pesquise por um produto..."
          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg shadow-md focus:outline-none 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
        />
      </div>

      {/* Botão de filtro aprimorado */}
      <Button
        icon="pi pi-filter"
        className="flex items-center justify-center p-3 text-black bg-transparent rounded-lg 
        hover:bg-white-700 focus:ring-2 focus:ring-gray-100 transition duration-300"
        onClick={onFilterClick}
        tooltip="Filtrar produtos"
        tooltipOptions={{ position: "top" }}
        aria-label="Abrir filtros"
      />
    </div>
  );
};

export default SearchBar;
