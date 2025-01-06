import { useState } from "react";
import PropTypes from "prop-types";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";

const SearchBar = ({ onResults = () => {} }) => { // Define onResults como função padrão
  const [query, setQuery] = useState(""); // Termo de busca
  const [selectedFilters, setSelectedFilters] = useState([]); // Filtros selecionados
  const [showFilterDialog, setShowFilterDialog] = useState(false); // Controle do modal de filtros

  const availableFilters = ["Bebidas", "Pratos", "Sobremesas", "Entradas"]; // Opções de filtro

  // Função para buscar produtos no backend
  const handleSearch = async () => {
    try {
      const url = new URL("http://127.0.0.1:5000/produtos/buscar");
      if (query) url.searchParams.append("query", query);
      if (selectedFilters.length > 0) {
        url.searchParams.append("filtro", selectedFilters.join(","));
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        onResults(data.data); // Atualiza os resultados no componente pai
      } else {
        console.error("Erro ao buscar produtos:", response.statusText);
        alert("Erro ao buscar produtos. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao se conectar ao servidor:", error);
      alert("Erro ao se conectar ao servidor. Verifique sua conexão.");
    }
  };

  // Atualiza os filtros selecionados
  const handleFilterChange = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg shadow-lg max-w-xl">
      {/* Botão de Pesquisa */}
      <Button
        icon="pi pi-search"
        className="p-button-text text-white hover:text-blue-400"
        style={{ backgroundColor: "transparent" }}
        onClick={handleSearch}
        aria-label="Pesquisar"
      />

      {/* Campo de Texto */}
      <InputText
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pesquisar produtos..."
        className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Botão de Filtro */}
      <Button
        icon="pi pi-filter"
        className="p-button-text text-white hover:text-blue-400"
        style={{ backgroundColor: "transparent" }}
        onClick={() => setShowFilterDialog(true)}
        aria-label="Filtrar"
      />

      {/* Modal de Filtros */}
      <Dialog
        header="Filtrar Produtos"
        visible={showFilterDialog}
        style={{ width: "40rem" }}
        onHide={() => setShowFilterDialog(false)}
        className="p-dialog-rounded-lg"
      >
        <div className="flex flex-col gap-6 p-6 bg-gray-100 rounded-lg">
          <h4 className="text-xl font-semibold text-gray-700">Selecione os filtros</h4>
          <div className="grid grid-cols-2 gap-4">
            {availableFilters.map((filter) => (
              <div key={filter} className="flex items-center gap-3">
                <Checkbox
                  inputId={filter}
                  checked={selectedFilters.includes(filter)}
                  onChange={() => handleFilterChange(filter)}
                />
                <label htmlFor={filter} className="text-gray-800">
                  {filter}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button
            label="Aplicar"
            icon="pi pi-check"
            className="p-button-primary"
            onClick={() => setShowFilterDialog(false)}
          />
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => setShowFilterDialog(false)}
          />
        </div>
      </Dialog>
    </div>
  );
};

SearchBar.propTypes = {
  onResults: PropTypes.func.isRequired, // Função para passar os resultados ao componente pai
};

export default SearchBar;
