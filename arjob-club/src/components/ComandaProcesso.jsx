import PropTypes from "prop-types";
import { useState } from "react";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";

const ComandaProcesso = ({
  selectedMesa,
  clienteInfo,
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

  const atualizarTotal = (itens) => {
    const novoTotal = itens.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
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
      cliente: clienteInfo.nome,
      itens: comandaItens,
      total,
    };
    console.log("Fechando comanda:", comanda);

    // Redirecionar para o histórico
    onFecharComanda(comanda);
  };

  return (
    <div>
      <h2>Comanda Mesa {selectedMesa.numero}</h2>
      <p>Nome: {clienteInfo?.nome}</p>
      <h3>Produtos Disponíveis</h3>
      <SearchBar
        onSearch={handleSearch}
        onFilterClick={() => setMostrarFiltro(!mostrarFiltro)}
      />
      {mostrarFiltro && <FilterBar categorias={categorias} />}
      <div className="produtos-container">
        {produtosCategoria.map((produto) => (
          <div key={produto.id} className="produto-item">
            <p>{produto.nome}</p>
            <p>R$ {produto.preco.toFixed(2)}</p>
            <button onClick={() => handleAdicionarProduto(produto)}>
              Adicionar
            </button>
          </div>
        ))}
      </div>

      <h3>Itens na Comanda</h3>
      {comandaItens.length > 0 ? (
        <div className="comanda-itens">
          {comandaItens.map((item) => (
            <div key={item.id} className="comanda-item">
              <p>{item.nome}</p>
              <p>
                R$ {item.preco.toFixed(2)} x {item.quantidade}
              </p>
              <button onClick={() => handleAdicionarProduto(item)}>+</button>
              <button onClick={() => handleRemoverProduto(item.id)}>-</button>
            </div>
          ))}
          <p><strong>Total:</strong> R$ {total.toFixed(2)}</p>
        </div>
      ) : (
        <p>Nenhum item adicionado.</p>
      )}

      <button onClick={handleFecharComanda}>Fechar Comanda</button>
      <button onClick={onBack}>Voltar</button>
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
    cpf: PropTypes.string,
  }),
  produtosCategoria: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
      preco: PropTypes.number.isRequired,
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
