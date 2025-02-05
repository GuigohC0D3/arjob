import PropTypes from "prop-types";
import { useState } from "react";
import { Paginator } from "primereact/paginator";
import SearchBar from "../Searchbar";
import FilterBar from "../FilterBar";

const ProdutoLista = ({
  produtosCategoria,
  handleAdicionarProduto,
  setMostrarFiltro,
  mostrarFiltro,
  categorias,
  handleFilter,
  handleSearch,
}) => {
  const [first, setFirst] = useState(0);
  const rows = 8; // Mostra múltiplos de 4 para manter o grid sempre cheio

  const onPageChange = (event) => {
    setFirst(event.first);
  };

  return (
    <div className="mt-8 max-w-6xl mx-auto px-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
        <h3 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <i className="pi pi-shopping-cart text-blue-500 text-3xl mr-2"></i>
          Produtos Disponíveis
        </h3>
        <SearchBar onSearch={handleSearch} onFilterClick={() => setMostrarFiltro(prev => !prev)} />
      </div>

      {/* Filtro */}
      {mostrarFiltro && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-sm">
          <FilterBar categorias={categorias} onFilter={handleFilter} />
        </div>
      )}

      {/* Verifica se há produtos */}
      <div className="mt-6">
        {produtosCategoria.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-6 bg-white py-6 rounded-lg shadow-md">
            Nenhum produto encontrado.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtosCategoria.slice(first, first + rows).map((produto) => (
              <div
                key={produto.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 
                flex flex-col justify-between items-center text-center h-[240px] min-h-[240px] border border-gray-200"
              >
                <p className="text-lg font-semibold text-gray-900">{produto.nome}</p>
                <p className="text-gray-600 text-md font-medium">
                  R$ {parseFloat(produto.preco).toFixed(2)}
                </p>
                
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-md 
                  hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 mt-auto shadow-md"
                  onClick={() => handleAdicionarProduto(produto)}
                >
                  <i className="pi pi-cart-plus"></i> Adicionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {produtosCategoria.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Paginator
            first={first}
            rows={rows}
            totalRecords={produtosCategoria.length}
            onPageChange={onPageChange}
          />
        </div>
      )}
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
