import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]); // Mesas vindas do backend
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [comandas, setComandas] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [historicoComandas, setHistoricoComandas] = useState([]);
  const [mostrarFecharComanda, setMostrarFecharComanda] = useState(false);
  const [comandaDetalhes, setComandaDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cpfCliente, setCpfCliente] = useState(""); // CPF do cliente
  const [clienteInfo, setClienteInfo] = useState(null); // Informações do cliente

  const categorias = ["Entradas", "Pratos", "Bebidas", "Sobremesas"];

  // Carregar mesas do backend
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:5000/mesas");
        if (response.ok) {
          const data = await response.json();
          setMesas(data); // Mesas no formato [{ id, numero, status }]
        } else {
          console.error("Erro ao carregar mesas");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesas();
  }, []);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleBuscarCliente = async () => {
    if (!cpfCliente) {
      alert("Por favor, insira um CPF válido.");
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/clientes/${cpfCliente.trim()}`);
      if (response.ok) {
        const data = await response.json();
        setClienteInfo(data);
        console.log("Informações do cliente:", data);
      } else {
        console.error("Cliente não encontrado");
        setClienteInfo(null);
        alert("Cliente não encontrado. Verifique o CPF.");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleAbrirComanda = async () => {
    if (!selectedMesa || !selectedMesa.id) {
      console.error("Mesa selecionada inválida:", selectedMesa);
      return;
    }

    if (!cpfCliente || !clienteInfo) {
      alert("Por favor, insira e busque o CPF do cliente antes de abrir a comanda.");
      return;
    }

    try {
      console.log("Tentando abrir comanda para a mesa:", selectedMesa);
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesa_id: selectedMesa.id, cliente_cpf: cpfCliente }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Comanda aberta ou existente:", data);
        setComandas({ ...comandas, [selectedMesa.id]: data.numero }); // Salva o número da comanda
      } else {
        const errorData = await response.json();
        console.error("Erro do servidor ao abrir comanda:", errorData);
      }
    } catch (error) {
      console.error("Erro ao abrir comanda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaClick = (categoria) => {
    setProdutosCategoria(
      produtos.filter((produto) => produto.categoria === categoria)
    );
  };

  const handleAdicionarProduto = (produto) => {
    console.log("Adicionar produto:", produto); // Integre com o backend para salvar produtos
  };

  const handleFecharComandaClick = () => {
    const comandaAtual = {
      mesa: selectedMesa.numero,
      comanda: comandas[selectedMesa.id],
      total: produtosCategoria.reduce((sum, produto) => sum + produto.preco, 0),
      itens: produtosCategoria,
      dataFechamento: new Date().toLocaleString(),
    };
    setComandaDetalhes(comandaAtual);
    setMostrarFecharComanda(true);
  };

  const handleConfirmarFechamento = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:5000/comandas/${comandaDetalhes.comanda}/fechar`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        // Adicionar ao histórico de comandas
        setHistoricoComandas([...historicoComandas, comandaDetalhes]);
        setMostrarFecharComanda(false);

        // Atualizar o status da mesa para disponível
        const mesaAtualizada = mesas.map((mesa) =>
          mesa.id === selectedMesa.id ? { ...mesa, status: "disponivel" } : mesa
        );
        setMesas(mesaAtualizada);

        setSelectedMesa(null);
        navigate("/Listagem");
      } else {
        console.error("Erro ao fechar comanda");
      }
    } catch (error) {
      console.error("Erro ao fechar comanda:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}

      {/* Listagem das Mesas */}
      {!selectedMesa && (
        <div className="mesas-container">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              className={`mesa ${mesa.status === "ocupada" ? "ocupada" : "disponivel"}`}
              onClick={() => handleMesaClick(mesa)}
            >
              Mesa {mesa.numero}
            </button>
          ))}
        </div>
      )}

      {/* Abertura de Comanda */}
      {selectedMesa && !comandas[selectedMesa.id] && (
        <div className="nova-comanda">
          <h2>Abrir Comanda</h2>
          <p>Mesa: {selectedMesa.numero}</p>

          <div className="cpf-container">
            <label>
              CPF do Cliente:
              <input
                type="text"
                value={cpfCliente}
                onChange={(e) => setCpfCliente(e.target.value)}
                placeholder="Digite o CPF"
              />
            </label>
            <button onClick={handleBuscarCliente}>Buscar Cliente</button>
          </div>

          {clienteInfo && (
            <div className="cliente-info">
              <h3>Informações do Cliente</h3>
              <p>Nome: {clienteInfo.nome}</p>
              <p>CPF: {clienteInfo.cpf}</p>
            </div>
          )}

          <button onClick={handleAbrirComanda}>Gerar e Abrir Comanda</button>
          <button onClick={() => setSelectedMesa(null)}>Voltar</button>
        </div>
      )}

      {/* Ver Comanda */}
      {selectedMesa && comandas[selectedMesa.id] && (
        <div>
          <h2>Comanda Mesa {selectedMesa.numero}</h2>
          <div>
            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => handleCategoriaClick(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>
          <div>
            {produtosCategoria.map((produto) => (
              <div key={produto.id}>
                <p>{produto.nome}</p>
                <p>R$ {produto.preco.toFixed(2)}</p>
                <button onClick={() => handleAdicionarProduto(produto)}>
                  Adicionar
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleFecharComandaClick}>Fechar Comanda</button>
          <button onClick={() => setSelectedMesa(null)}>Voltar</button>
        </div>
      )}

      {/* Modal para Fechar Comanda */}
      {mostrarFecharComanda && (
        <div className="modal">
          <h2>Fechar Comanda</h2>
          <p>Mesa: {comandaDetalhes.mesa}</p>
          <p>Total: R$ {comandaDetalhes.total.toFixed(2)}</p>
          <ul>
            {comandaDetalhes.itens.map((item) => (
              <li key={item.id}>
                {item.nome} - R$ {item.preco.toFixed(2)}
              </li>
            ))}
          </ul>
          <button onClick={handleConfirmarFechamento}>Confirmar</button>
          <button onClick={() => setMostrarFecharComanda(false)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default IniciarVenda;
