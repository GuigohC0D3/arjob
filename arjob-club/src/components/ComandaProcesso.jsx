import PropTypes from "prop-types";
import { useState } from "react";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";

const ComandaProcesso = ({
  selectedMesa,
  clienteInfo,
  cpfInfo,
  produtosCategoria,
  categorias,
  setProdutosCategoria,
  produtosCategoriaOriginal,
  mostrarFiltro,
  setMostrarFiltro,
  onFecharComanda,
  onBack,
}) => {
  const [comandaItens, setComandaItens] = useState([]);
  const [total, setTotal] = useState(0);

  const handleSearch = (query) => {
    if (!query) {
      setProdutosCategoria(produtosCategoriaOriginal);
      return;
    }
    const filteredProducts = produtosCategoriaOriginal.filter((produto) =>
      produto.nome.toLowerCase().includes(query.toLowerCase())
    );
    setProdutosCategoria(filteredProducts);
  };

  const handleFilter = (categoria) => {
    if (!categoria) {
      setProdutosCategoria(produtosCategoriaOriginal);
      return;
    }
    const filteredProducts = produtosCategoriaOriginal.filter(
      (produto) => produto.categoria === categoria
    );
    setProdutosCategoria(filteredProducts);
  };

  const atualizarTotal = (itens) => {
    const novoTotal = itens.reduce(
      (acc, item) => acc + parseFloat(item.preco) * item.quantidade,
      0
    );
    setTotal(novoTotal);
  };

  const handleAdicionarProduto = (produto) => {
    setComandaItens((prevItens) => {
      const itemExistente = prevItens.find((item) => item.id === produto.id);
      if (itemExistente) {
        const novosItens = prevItens.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
        atualizarTotal(novosItens);
        return novosItens;
      } else {
        const novosItens = [...prevItens, { ...produto, quantidade: 1 }];
        atualizarTotal(novosItens);
        return novosItens;
      }
    });
  };

  const handleRemoverProduto = (produtoId) => {
    setComandaItens((prevItens) => {
      const novosItens = prevItens
        .map((item) =>
          item.id === produtoId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0);
      atualizarTotal(novosItens);
      return novosItens;
    });
  };

  const handleFecharComanda = () => {
    const comanda = {
      mesa: selectedMesa.numero,
      cliente: clienteInfo?.nome,
      cpf: cpfInfo?.cpf,
      itens: comandaItens,
      total,
    };
    console.log("Fechando comanda:", comanda);

    // Redirecionar para o histórico
    onFecharComanda(comanda);
  };

  return (
    <div className="p-4">
      <h2>Comanda Mesa {selectedMesa.numero}</h2>
      <p>Nome: {clienteInfo?.nome || "Desconhecido"}</p>
      <p>CPF: {cpfInfo?.cpf || "Não informado"}</p>

      <h3>Produtos Disponíveis</h3>
      <SearchBar
        onSearch={handleSearch}
        onFilterClick={() => setMostrarFiltro(!mostrarFiltro)}
      />
      {mostrarFiltro && (
        <FilterBar
          categorias={categorias}
          onFilter={handleFilter} // Passando a função de filtro
        />
      )}
      <div className="produtos-container">
        {produtosCategoria.map((produto) => {
          const preco = parseFloat(produto.preco);
          if (isNaN(preco)) {
            console.error("Preço inválido para o produto:", produto);
            return null;
          }

          return (
            <div key={produto.id} className="produto-item">
              <p>{produto.nome}</p>
              <p>R$ {preco.toFixed(2)}</p>
              <button onClick={() => handleAdicionarProduto(produto)}>
                Adicionar
              </button>
            </div>
          );
        })}
      </div>

      {/* Itens na Comanda */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Itens na Comanda
        </h3>
        {comandaItens.length > 0 ? (
          <div className="bg-gray-100 rounded-lg shadow-lg">
            {/* Área de Itens com Scroll */}
            <div className="max-h-64 overflow-y-auto p-4 space-y-4">
              {comandaItens.map((item) => {
                const preco = parseFloat(item.preco);
                if (isNaN(preco)) {
                  console.error("Preço inválido para o item:", item);
                  return null;
                }

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-gray-300 pb-2 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-lg font-bold">{item.nome}</p>
                      <p className="text-sm text-gray-600 font-bold">
                        R$ {preco.toFixed(2)} x {item.quantidade}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {" "}
                      {/* Espaçamento maior entre botões e texto */}
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-300"
                        onClick={() => handleAdicionarProduto(item)}
                      >
                        +
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300"
                        onClick={() => handleRemoverProduto(item.id)}
                      >
                        -
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Área do Total */}
            <div className="bg-gray-200 p-4 rounded-b-lg">
              <p className="text-xl font-bold text-right">
                Total: R$ {total.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">Nenhum item adicionado.</p>
        )}
      </div>

      {/* Botões de ação */}
      <div className="mt-6 flex justify-between">
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-300"
          onClick={handleFecharComanda}
        >
          Fechar Comanda
        </button>
        <button
          className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition duration-300"
          onClick={onBack}
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

ComandaProcesso.propTypes = {
  selectedMesa: PropTypes.shape({
    id: PropTypes.number.isRequired,
    numero: PropTypes.number.isRequired,
  }).isRequired,
  clienteInfo: PropTypes.shape({
    nome: PropTypes.string,
  }).isRequired,
  cpfInfo: PropTypes.shape({
    cpf: PropTypes.string,
  }).isRequired,
  produtosCategoria: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
      preco: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
    })
  ).isRequired,
  categorias: PropTypes.arrayOf(PropTypes.string).isRequired,
  setProdutosCategoria: PropTypes.func.isRequired,
  produtosCategoriaOriginal: PropTypes.array.isRequired,
  mostrarFiltro: PropTypes.bool.isRequired,
  setMostrarFiltro: PropTypes.func.isRequired,
  onFecharComanda: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ComandaProcesso;
