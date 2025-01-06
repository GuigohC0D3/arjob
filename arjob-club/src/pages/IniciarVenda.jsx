import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const navigate = useNavigate();

  // Estados principais
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [comandas, setComandas] = useState({});
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [historicoComandas, setHistoricoComandas] = useState([]);

  // Estados auxiliares
  const [mostrarFecharComanda, setMostrarFecharComanda] = useState(false);
  const [comandaDetalhes, setComandaDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cpfCliente, setCpfCliente] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);

  // Carregar mesas ao montar o componente
  useEffect(() => {
    const fetchMesas = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5000/mesas");
        if (response.ok) {
          const data = await response.json();
          setMesas(data);
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

  // Selecionar mesa
  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
  };

  // Buscar cliente pelo CPF
  const handleBuscarCliente = async () => {
    const cpfLimpo = cpfCliente.replace(/\D/g, ""); // Remove formatações
    if (!cpfLimpo) {
      alert("Por favor, insira um CPF válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/clientes/${cpfLimpo.trim()}`
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setClienteInfo(data[0]); // Pegamos o primeiro item do array
        } else {
          setClienteInfo(null);
          alert("Cliente não encontrado. Verifique o CPF.");
        }
      } else {
        setClienteInfo(null);
        alert("Cliente não encontrado. Verifique o CPF.");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir nova comanda
  const handleAbrirComanda = async () => {
    if (!selectedMesa || !selectedMesa.id) {
      alert("Selecione uma mesa para abrir a comanda.");
      return;
    }

    if (!cpfCliente || !clienteInfo) {
      alert("Insira e busque o CPF do cliente antes de abrir a comanda.");
      return;
    }

    setLoading(true);
    try {
      // Abrir a comanda
      const response = await fetch("http://127.0.0.1:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: selectedMesa.id,
          cliente_cpf: cpfCliente,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComandas((prev) => ({ ...prev, [selectedMesa.id]: data.numero }));

        // Buscar produtos disponíveis
        const produtosResponse = await fetch("http://127.0.0.1:5000/produtos");
        if (produtosResponse.ok) {
          const produtos = await produtosResponse.json();
          console.log("Produtos recebidos:", produtos); // Debug
          setProdutosCategoria(produtos);
        } else {
          console.error("Erro ao carregar produtos.");
        }
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

  // Fechar comanda
  const handleFecharComandaClick = async () => {
    if (!selectedMesa || !comandas[selectedMesa.id]) {
      alert("Não há uma comanda aberta para esta mesa.");
      return;
    }

    setLoading(true);
    try {
      const comandaId = comandas[selectedMesa.id];
      const response = await fetch(
        `http://127.0.0.1:5000/comandas/${comandaId}/fechar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        setMesas((prev) =>
          prev.map((mesa) =>
            mesa.id === selectedMesa.id
              ? { ...mesa, status: "disponivel" }
              : mesa
          )
        );
        setHistoricoComandas((prev) => [
          ...prev,
          { mesa: selectedMesa.numero, comanda: comandaId },
        ]);
        setSelectedMesa(null);
        alert("Comanda fechada com sucesso!");
      } else {
        alert("Não foi possível fechar a comanda. Tente novamente.");
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

      {!selectedMesa && (
        <div className="mesas-container">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              className={`mesa ${
                mesa.status === "ocupada" ? "ocupada" : "disponivel"
              }`}
              onClick={() => handleMesaClick(mesa)}
            >
              Mesa {mesa.numero}
            </button>
          ))}
        </div>
      )}

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

          {clienteInfo ? (
            <div className="cliente-info">
              <h3>Informações do Cliente</h3>
              <p>Nome: {clienteInfo.nome || "Não encontrado"}</p>
              <p>CPF: {clienteInfo.cpf || "Não encontrado"}</p>
            </div>
          ) : (
            <div className="cliente-info">
              <h3>Informações do Cliente</h3>
              <p>Nome: Nome não encontrado</p>
              <p>CPF: CPF não encontrado</p>
            </div>
          )}

          <button onClick={handleAbrirComanda}>Gerar e Abrir Comanda</button>
          <button onClick={() => setSelectedMesa(null)}>Voltar</button>
        </div>
      )}

      {selectedMesa && comandas[selectedMesa.id] && (
        <div>
          <h2>Comanda Mesa {selectedMesa.numero}</h2>
          <p className="select-mesa">Nome: {clienteInfo?.nome}</p>
          <p className="select-mesa">CPF: {clienteInfo?.cpf}</p>

          <h3>Produtos Disponíveis</h3>
          <div className="produtos-container">
            {produtosCategoria.map((produto) => {
              const preco = parseFloat(produto.preco); // Converte para número
              if (isNaN(preco)) {
                console.error("Preço inválido para o produto:", produto);
                return null; // Ignora produtos com preço inválido
              }

              return (
                <div key={produto.id} className="produto-item">
                  <p>{produto.nome}</p>
                  <p>R$ {preco.toFixed(2)}</p>
                  <button
                    onClick={() => console.log("Produto adicionado:", produto)}
                  >
                    Adicionar
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={handleFecharComandaClick}>Fechar Comanda</button>
          <button onClick={() => setSelectedMesa(null)}>Voltar</button>
        </div>
      )}

      {historicoComandas.length > 0 && (
        <div className="historico-comandas">
          <h3>Histórico de Comandas</h3>
          <ul>
            {historicoComandas.map((historico, index) => (
              <li key={index}>
                Mesa {historico.mesa} - Comanda {historico.comanda}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mostrarFecharComanda && (
        <div className="modal">
          <h2>Fechar Comanda</h2>
          <p>Mesa: {comandaDetalhes?.mesa}</p>
          <p>Total: R$ {comandaDetalhes?.total?.toFixed(2)}</p>
          <ul>
            {comandaDetalhes?.itens.map((item) => (
              <li key={item.id}>
                {item.nome} - R$ {item.preco.toFixed(2)}
              </li>
            ))}
          </ul>
          <button onClick={handleFecharComandaClick}>Confirmar</button>
          <button onClick={() => setMostrarFecharComanda(false)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default IniciarVenda;
