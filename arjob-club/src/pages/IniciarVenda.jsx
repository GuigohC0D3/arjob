import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]); // Mesas vindas do backend
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [comandas, setComandas] = useState({});
  const [novaComanda, setNovaComanda] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [historicoComandas, setHistoricoComandas] = useState([]);
  const [mostrarFecharComanda, setMostrarFecharComanda] = useState(false);
  const [comandaDetalhes, setComandaDetalhes] = useState(null);

  const categorias = ["Entradas", "Pratos", "Bebidas", "Sobremesas"];

  // Carregar mesas e produtos do backend
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/mesas");
        if (response.ok) {
          const data = await response.json();
          setMesas(data); // Mesas devem vir no formato [{ id, numero, status }]
        } else {
          console.error("Erro ao carregar mesas");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };

    fetchMesas();
  }, []);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleAbrirComanda = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: novaComanda, mesa_id: selectedMesa.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setComandas({ ...comandas, [selectedMesa.id]: data.comanda_id });
        setNovaComanda("");
      }
    } catch (error) {
      console.error("Erro ao abrir comanda:", error);
    }
  };

  const handleCategoriaClick = (categoria) => {
    setProdutosCategoria(produtos.filter((produto) => produto.categoria === categoria));
  };

  const handleAdicionarProduto = (produto) => {
    console.log("Adicionar produto:", produto); // Pode ser integrado para enviar ao backend
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
      await fetch(`http://127.0.0.1:5000/comandas/${comandaDetalhes.comanda}/fechar`, {
        method: "PUT",
      });
      setHistoricoComandas([...historicoComandas, comandaDetalhes]);
      setMostrarFecharComanda(false);
      setSelectedMesa(null);
      navigate("/Listagem");
    } catch (error) {
      console.error("Erro ao fechar comanda:", error);
    }
  };

  return (
    <div>
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
          <input
            type="text"
            placeholder="Número da Comanda"
            value={novaComanda}
            onChange={(e) => setNovaComanda(e.target.value)}
          />
          <button onClick={handleAbrirComanda} disabled={!novaComanda}>
            Abrir
          </button>
          <button onClick={() => setSelectedMesa(null)}>Voltar</button>
        </div>
      )}

      {/* Comanda Ativa */}
      {selectedMesa && comandas[selectedMesa.id] && (
        <div>
          <h2>Comanda Mesa {selectedMesa.numero}</h2>
          <div>
            {categorias.map((categoria) => (
              <button key={categoria} onClick={() => handleCategoriaClick(categoria)}>
                {categoria}
              </button>
            ))}
          </div>
          <div>
            {produtosCategoria.map((produto) => (
              <div key={produto.id}>
                <p>{produto.nome}</p>
                <p>R$ {produto.preco.toFixed(2)}</p>
                <button onClick={() => handleAdicionarProduto(produto)}>Adicionar</button>
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
              <li key={item.id}>{item.nome} - R$ {item.preco.toFixed(2)}</li>
            ))}
          </ul>
          <button onClick={handleConfirmarFechamento}>Confirmar</button>
          <button onClick={() => setMostrarFecharComanda(false)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default IniciarVenda;
