import { useState } from "react";
import PropTypes from "prop-types";
import ComandaHeader from "./comandaComponents/ComandaHeader";
import ProdutoLista from "./comandaComponents/ProdutoLista";
import ComandaItens from "./comandaComponents/ComandaItens";
import ComandaActions from "./comandaComponents/ComandaActions";

const ComandaProcesso = ({
  selectedMesa,
  clienteInfo,
  cpfInfo,
  produtosCategoriaOriginal,
  categorias,
  setMostrarFiltro,
  mostrarFiltro,
  onFecharComanda,
  onAtualizarMesas,
  onBack,
}) => {
  const [comandaItens, setComandaItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // Estado da busca
  const [produtosCategoria, setProdutosCategoria] = useState(
    produtosCategoriaOriginal
  );
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
      let novosItens;

      if (itemExistente) {
        novosItens = prevItens.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
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
          item.id === produtoId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0);

      atualizarTotal(novosItens);
      return novosItens;
    });
  };

  const handleFecharComanda = async () => {
    const code = selectedMesa?.code?.trim();

    if (!code || code === "MISSING_CODE") {
      alert("Erro: Código da comanda não encontrado ou inválido.");
      console.error("Erro: Código da comanda é inválido:", code);
      return;
    }

    // 🔍 Debug: Garantir que estamos enviando os dados certos
    console.log("🔹 Enviando dados para o backend:", {
      total,
      mesa: selectedMesa.id,
    });

    try {
      const response = await fetch(
        `http://10.11.1.67:5000/comandas/${code}/fechar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            total: parseFloat(total), // 🔥 Garante que `total` é um número
            mesa: selectedMesa.id, // 🔥 Garante que `mesa` é o ID correto
          }),
        }
      );

      if (response.ok) {
        alert("Comanda fechada com sucesso!");
        onAtualizarMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa.id === selectedMesa.id ? { ...mesa, status: false } : mesa
          )
        );
        onFecharComanda();
      } else {
        const errorResponse = await response.json();
        console.error("Erro ao fechar comanda:", errorResponse);
        alert(
          `Erro ao fechar comanda: ${errorResponse.error || "Desconhecido"}`
        );
      }
    } catch (error) {
      console.error("Erro na requisição de fechamento:", error);
      alert("Erro ao fechar a comanda. Tente novamente mais tarde.");
    }
  };

  // ✅ **Correção do filtro por categoria**
  const handleFilter = (categoria) => {
    if (!categoria || categoria === "Todas") {
      setProdutosCategoria(produtosCategoriaOriginal); // Exibe todos os produtos
    } else {
      const produtosFiltrados = produtosCategoriaOriginal.filter(
        (produto) => produto.categoria.toLowerCase() === categoria.toLowerCase()
      );
      setProdutosCategoria(produtosFiltrados);
    }
  };

  // ✅ **Busca dinâmica SEM ALTERAR `produtosCategoria`**
  const produtosFiltrados = produtosCategoria.filter((produto) =>
    produto.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col">
      <ComandaHeader
        selectedMesa={{
          ...selectedMesa,
          status: selectedMesa.status ? "ocupada" : "disponivel",
        }}
        clienteInfo={clienteInfo}
        cpfInfo={cpfInfo}
      />
      <ProdutoLista
        produtosCategoria={produtosFiltrados}
        setMostrarFiltro={setMostrarFiltro} // ✅ Corrigido!
        mostrarFiltro={mostrarFiltro} // ✅ Passamos o estado correto
        categorias={categorias}
        handleFilter={handleFilter}
        handleAdicionarProduto={handleAdicionarProduto}
        handleSearch={setSearchQuery}
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
    code: PropTypes.string,
    status: PropTypes.bool.isRequired, // ✅ Agora status é uma string
  }).isRequired,
  clienteInfo: PropTypes.shape({
    nome: PropTypes.string,
  }).isRequired,
  cpfInfo: PropTypes.shape({
    cpf: PropTypes.string,
  }).isRequired,
  produtosCategoriaOriginal: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
      preco: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      categoria: PropTypes.string.isRequired, // Adicionei essa linha para garantir que os produtos tenham categoria
    })
  ).isRequired,
  categorias: PropTypes.arrayOf(PropTypes.string).isRequired,
  setMostrarFiltro: PropTypes.func.isRequired,
  mostrarFiltro: PropTypes.bool.isRequired,
  onFecharComanda: PropTypes.func.isRequired,
  onAtualizarMesas: PropTypes.func.isRequired,
  comandaId: PropTypes.string,
  onBack: PropTypes.func.isRequired,
};

export default ComandaProcesso;
