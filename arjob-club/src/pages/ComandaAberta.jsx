import PropTypes from "prop-types";
import { useState } from "react";
import SearchBar from "../components/Searchbar";
import FilterBar from "../components/FilterBar";
import "./IniciarVenda.css";

const ComandaAberta = ({ mesaSelecionada, onVoltar }) => {
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [produtosCategoriaOriginal, setProdutosCategoriaOriginal] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cpfCliente, setCpfCliente] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comandaAberta, setComandaAberta] = useState(false); // Controle da exibição das barras de pesquisa e filtro

  const handleCpfChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedCPF = value
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
    setCpfCliente(formattedCPF);
  };

  const handleBuscarCliente = async () => {
    const cpfLimpo = cpfCliente.replace(/\D/g, "");
    if (!cpfLimpo) {
      alert("Por favor, insira um CPF válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/clientes/${cpfLimpo.trim()}`);
      if (response.ok) {
        const data = await response.json();
        setClienteInfo(data[0] || null);
        if (!data[0]) alert("Cliente não encontrado. Verifique o CPF.");
      } else {
        alert("Cliente não encontrado. Verifique o CPF.");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirComanda = async () => {
    if (!mesaSelecionada || !mesaSelecionada.id) {
      alert("Selecione uma mesa válida.");
      return;
    }

    if (!cpfCliente || !clienteInfo) {
      alert("Insira e busque o CPF do cliente antes de abrir a comanda.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesa_id: mesaSelecionada.id, cliente_cpf: cpfCliente }),
      });

      if (response.ok) {
        const produtosResponse = await fetch("http://127.0.0.1:5000/produtos");
        if (produtosResponse.ok) {
          const produtos = await produtosResponse.json();
          setProdutosCategoria(produtos);
          setProdutosCategoriaOriginal(produtos);
          setCategorias([...new Set(produtos.map((produto) => produto.categoria))]);
          setComandaAberta(true); // Ativando a exibição das barras de pesquisa e filtro
        }
      } else {
        alert("Erro ao abrir comanda. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao abrir comanda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByCategory = (categoria) => {
    setProdutosCategoria(
      categoria ? produtosCategoriaOriginal.filter((p) => p.categoria === categoria) : produtosCategoriaOriginal
    );
  };

  const handleSearch = (query) => {
    setProdutosCategoria(
      query
        ? produtosCategoriaOriginal.filter((produto) => produto.nome.toLowerCase().includes(query.toLowerCase()))
        : produtosCategoriaOriginal
    );
  };

  return (
    <div>
      <h2>Comanda Mesa {mesaSelecionada?.numero || "Não selecionada"}</h2>
      {loading && <p>Carregando...</p>}

      <div className="cpf-container">
        <label>
          CPF do Cliente:
          <input
            type="text"
            value={cpfCliente}
            onChange={handleCpfChange}
            placeholder="Digite o CPF (123.456.789-00)"
          />
        </label>
        <button onClick={handleBuscarCliente}>Buscar Cliente</button>
      </div>

      {clienteInfo && (
        <div>
          <p>Nome: {clienteInfo.nome}</p>
          <p>CPF: {clienteInfo.cpf}</p>
        </div>
      )}

      <button onClick={handleAbrirComanda}>Abrir Comanda</button>
      <button onClick={onVoltar}>Voltar</button>

      {comandaAberta && ( // Exibe as barras de pesquisa e filtro apenas se a comanda estiver aberta
        <>
          <SearchBar onSearch={handleSearch} />
          <FilterBar categorias={categorias} onFilter={handleFilterByCategory} />
        </>
      )}

      {comandaAberta && (
        <div className="produtos-container">
          {produtosCategoria.map((produto) => (
            <div key={produto.id} className="produto-item">
              <p>{produto.nome}</p>
              <p>R$ {produto.preco.toFixed(2)}</p>
              <button onClick={() => console.log("Adicionado", produto)}>Adicionar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ComandaAberta.propTypes = {
  mesaSelecionada: PropTypes.shape({
    id: PropTypes.number.isRequired,
    numero: PropTypes.string.isRequired,
  }),
  onVoltar: PropTypes.func.isRequired,
};

export default ComandaAberta;
