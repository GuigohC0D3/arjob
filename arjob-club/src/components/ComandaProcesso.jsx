import { useState } from "react";
import PropTypes from "prop-types";
import ComandaHeader from "./comandaComponents/ComandaHeader";
import ProdutoLista from "./comandaComponents/ProdutoLista";
import ComandaItens from "./comandaComponents/ComandaItens";
import ComandaActions from "./comandaComponents/ComandaActions";

const ComandaProcesso = ({ 
  selectedMesa, clienteInfo, cpfInfo, produtosCategoria, categorias, setProdutosCategoria,
  produtosCategoriaOriginal, mostrarFiltro, setMostrarFiltro, onFecharComanda,
  onAtualizarMesas, comandaId, onBack 
}) => {
  const [comandaItens, setComandaItens] = useState([]);
  const [total, setTotal] = useState(0);

  const atualizarTotal = (itens) => {
    const novoTotal = itens.reduce((acc, item) => acc + parseFloat(item.preco) * item.quantidade, 0);
    setTotal(novoTotal);
  };

  const handleAdicionarProduto = (produto) => {
    setComandaItens((prevItens) => {
      const itemExistente = prevItens.find((item) => item.id === produto.id);
      let novosItens;
      
      if (itemExistente) {
        novosItens = prevItens.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      } else {
        novosItens = [...prevItens, { ...produto, quantidade: 1 }];
      }

      atualizarTotal(novosItens);
      return novosItens;
    });
  };

  const handleRemoverProduto = (produtoId) => {
    setComandaItens((prevItens) => {
      const novosItens = prevItens
        .map((item) =>
          item.id === produtoId ? { ...item, quantidade: item.quantidade - 1 } : item
        )
        .filter((item) => item.quantidade > 0);

      atualizarTotal(novosItens);
      return novosItens;
    });
  };

  const handleFecharComanda = async () => {
    if (!comandaId || typeof comandaId !== "string") {
      alert("ID da comanda inválido ou ausente.");
      return;
    }

    const comanda = {
      mesa: selectedMesa.numero,
      cliente: clienteInfo?.nome || "Desconhecido",
      cpf: cpfInfo?.cpf || "Não informado",
      itens: comandaItens,
      total,
    };

    try {
      const response = await fetch(
        `http://10.11.1.67:5000/comandas/${encodeURIComponent(comandaId)}/fechar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comanda),
        }
      );

      if (response.ok) {
        alert("Comanda fechada com sucesso!");
        onAtualizarMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa.id === selectedMesa.id ? { ...mesa, status: "disponivel" } : mesa
          )
        );
        onFecharComanda();
      } else {
        const errorResponse = await response.json();
        alert(`Erro ao fechar comanda: ${errorResponse.error || "Desconhecido"}`);
      }
    } catch (error) {
      alert("Erro ao fechar a comanda. Tente novamente mais tarde.");
    }
  };

  const handleSearch = (query) => {
    setProdutosCategoria(
      query
        ? produtosCategoriaOriginal.filter((produto) =>
            produto.nome.toLowerCase().includes(query.toLowerCase())
          )
        : produtosCategoriaOriginal
    );
  };

  const handleFilter = (categoria) => {
    setProdutosCategoria(
      categoria
        ? produtosCategoriaOriginal.filter(
            (produto) => produto.categoria === categoria
          )
        : produtosCategoriaOriginal
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
      <ComandaHeader selectedMesa={selectedMesa} clienteInfo={clienteInfo} cpfInfo={cpfInfo} />
      <ProdutoLista 
        produtosCategoria={produtosCategoria}
        handleAdicionarProduto={handleAdicionarProduto}
        setMostrarFiltro={setMostrarFiltro}
        mostrarFiltro={mostrarFiltro}
        categorias={categorias}
        handleFilter={handleFilter}
        handleSearch={handleSearch}
      />
      <ComandaItens 
        comandaItens={comandaItens}
        handleAdicionarProduto={handleAdicionarProduto}
        handleRemoverProduto={handleRemoverProduto}
        total={total}
      />
      <ComandaActions 
        handleFecharComanda={handleFecharComanda}
        onBack={onBack}
      />
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
      preco: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ).isRequired,
  categorias: PropTypes.arrayOf(PropTypes.string).isRequired,
  setProdutosCategoria: PropTypes.func.isRequired,
  produtosCategoriaOriginal: PropTypes.array.isRequired,
  mostrarFiltro: PropTypes.bool.isRequired,
  setMostrarFiltro: PropTypes.func.isRequired,
  onFecharComanda: PropTypes.func.isRequired,
  onAtualizarMesas: PropTypes.func.isRequired,
  comandaId: PropTypes.string,
  onBack: PropTypes.func.isRequired,
};

export default ComandaProcesso;
