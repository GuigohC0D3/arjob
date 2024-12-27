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

  const handleAbrirComanda = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesa_id: selectedMesa.id }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Comanda aberta ou existente:", data);
        setComandas({ ...comandas, [selectedMesa.id]: data.numero }); // Salva o número da comanda
      } else {
        const errorData = await response.json();
        if (errorData.error === "Mesa já está ocupada") {
          console.log("Mesa já ocupada, carregando comanda existente.");
          setComandas({ ...comandas, [selectedMesa.id]: errorData.numero }); // Carregar comanda existente
        } else {
          console.error("Erro do servidor:", errorData);
        }
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
        setHistoricoComandas([...historicoComandas, comandaDetalhes]);
        setMostrarFecharComanda(false);
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

      {/* Abertura de Comanda */}
      {selectedMesa && !comandas[selectedMesa.id] && (
        <div className="nova-comanda">
          <h2>Abrir Comanda</h2>
          <p>Mesa: {selectedMesa.numero}</p>
          <button onClick={handleAbrirComanda}>Gerar e Abrir Comanda</button>
          <button onClick={() => setSelectedMesa(null)}>Voltar</button>
        </div>
      )}

      {/* Comanda Ativa */}
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
