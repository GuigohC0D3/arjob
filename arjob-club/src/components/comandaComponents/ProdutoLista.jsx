import PropTypes from "prop-types";
import { useState } from "react";
import { Paginator } from "primereact/paginator";
import { Button } from "primereact/button";
import SearchBar from "../Searchbar";
import FilterBar from "../FilterBar";

const ProdutoLista = ({ 
  produtosCategoria, 
  handleAdicionarProduto, 
  setMostrarFiltro, 
  mostrarFiltro, 
  categorias, 
  handleFilter, 
  handleSearch 
}) => {
  const [first, setFirst] = useState(0);
  const rows = 6; // Fixado para sempre mostrar 6 produtos (3 colunas x 2 linhas)

  const onPageChange = (event) => {
    setFirst(event.first);
  };

  return (
    <div className="mt-8 max-w-5xl mx-auto px-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <i className="pi pi-shopping-cart text-blue-500 text-2xl mr-2"></i> 
          Produtos Disponíveis
        </h3>
      </div>

      {/* Barra de Pesquisa e Filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4">
        <SearchBar 
          onSearch={handleSearch} 
          onFilterClick={() => setMostrarFiltro(!mostrarFiltro)} 
        />
      </div>

      {/* Filtro */}
      {mostrarFiltro && (
        <div className="mt-4">
          <FilterBar categorias={categorias} onFilter={handleFilter} />
        </div>
      )}

      {/* Lista de Produtos - Layout Horizontal */}
      <div className="mt-6 flex flex-wrap justify-center gap-6">
        {produtosCategoria.slice(first, first + rows).map((produto) => (
          <div 
            key={produto.id} 
            className="bg-white p-5 w-[30%] rounded-xl shadow-md hover:shadow-lg 
            transition duration-300 border border-gray-200 flex flex-col items-center"
          >
            <p className="text-lg font-semibold text-gray-900 text-center">{produto.nome}</p>
            <p className="text-gray-600 mt-1">
              <i className="pi pi-dollar text-green-500 mr-1"></i> R$ {parseFloat(produto.preco).toFixed(2)}
            </p>

            <Button
              label="Adicionar"
              icon="pi pi-cart-plus"
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium 
              hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 
              focus:ring-blue-400 focus:ring-offset-2"
              onClick={() => handleAdicionarProduto(produto)}
            />
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="mt-6 flex justify-center">
        <Paginator 
          first={first} 
          rows={rows} 
          totalRecords={produtosCategoria.length} 
          onPageChange={onPageChange} 
        />
      </div>
    </div>
  );
};

ProdutoLista.propTypes = {
  produtosCategoria: PropTypes.array.isRequired,
  handleAdicionarProduto: PropTypes.func.isRequired,
  setMostrarFiltro: PropTypes.func.isRequired,
  mostrarFiltro: PropTypes.bool.isRequired,
  categorias: PropTypes.array.isRequired,
  handleFilter: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
};

export default ProdutoLista;
