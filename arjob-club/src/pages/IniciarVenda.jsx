import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const navigate = useNavigate();
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [comandas, setComandas] = useState({});
  const [novaComanda, setNovaComanda] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [historicoComandas, setHistoricoComandas] = useState([]);
  const [mostrarFecharComanda, setMostrarFecharComanda] = useState(false);
  const [comandaDetalhes, setComandaDetalhes] = useState(null);

  const categorias = ["Entradas", "Pratos", "Bebidas", "Sobremesas"];

  const produtosMock = [
    { id: 1, nome: "Cerveja", preco: 12.0, categoria: "Bebidas" },
    { id: 2, nome: "Coca-Cola", preco: 5.0, categoria: "Bebidas" },
    { id: 3, nome: "Picanha", preco: 45.99, categoria: "Pratos" },
    { id: 4, nome: "Petit Gateau", preco: 20.0, categoria: "Sobremesas" },
  ];

  const mesas = Array.from({ length: 20 }, (_, i) => i + 1);

  useEffect(() => {
    const storedHistorico = localStorage.getItem("historicoComandas");
    if (storedHistorico) {
      setHistoricoComandas(JSON.parse(storedHistorico));
    }
  }, []);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleAbrirComanda = () => {
    setComandas({ ...comandas, [selectedMesa]: novaComanda });
    setNovaComanda("");
  };

  const handleFecharComandaClick = () => {
    console.log("Fechar Comanda Click"); // Verificando se a função é chamada
    const comandaAtual = {
      mesa: selectedMesa,
      comanda: comandas[selectedMesa],
      total: 340.0, // Substitua pelo cálculo real
      itens: produtosMock.slice(0, 3), // Exemplo de itens adicionados
      dataFechamento: new Date().toLocaleString(),
    };
    setComandaDetalhes(comandaAtual);
    setMostrarFecharComanda(true);
  };

  const handleConfirmarFechamento = () => {
    const updatedHistorico = [...historicoComandas, comandaDetalhes];
    setHistoricoComandas(updatedHistorico);
    localStorage.setItem("historicoComandas", JSON.stringify(updatedHistorico));

    const novasComandas = { ...comandas };
    delete novasComandas[selectedMesa];
    setComandas(novasComandas);

    setMostrarFecharComanda(false);
    setSelectedMesa(null);
    navigate("/listagem-comanda");
  };

  const handleImportar = () => {
    navigate("/listagem-comanda");
  };

  return (
    <>
      {!selectedMesa && (
        <div className="mesas-container">
          {mesas.map((mesa) => (
            <button
              key={mesa}
              className={`mesa ${comandas[mesa] ? "ocupada" : "disponivel"}`}
              onClick={() => handleMesaClick(mesa)}
            >
              {mesa}
              {comandas[mesa] && (
                <div className="comanda-info">
                  <p>Tempo: 4H45M</p>
                  <p>Total: R$340,00</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedMesa && !comandas[selectedMesa] && (
        <div className="nova-comanda">
          <h2>Abertura de comanda</h2>
          <p>Mesa: {selectedMesa}</p>
          <input
            type="text"
            placeholder="Número da Comanda"
            value={novaComanda}
            onChange={(e) => setNovaComanda(e.target.value)}
          />
          <div className="botoes">
            <button className="voltar" onClick={() => setSelectedMesa(null)}>
              Voltar
            </button>
            <button
              className="abrir"
              onClick={handleAbrirComanda}
              disabled={!novaComanda}
            >
              Abrir Comanda
            </button>
          </div>
        </div>
      )}

      {selectedMesa && comandas[selectedMesa] && (
        <div className="comanda-mesa">
          <div className="header-comanda">
            <div className="comanda-info">
              <h2>Comanda: {comandas[selectedMesa]}</h2>
              <p>Mesa: {selectedMesa}</p>
              <p>Garçom: Guilherme</p>
              <p>Tempo: 14h45m</p>
            </div>
            <div className="valor-comanda">
              <h2>R$340,00</h2>
              <p>Serviço (10%): R$ 20,00</p>
            </div>
          </div>

          <div className="categorias">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                className="categoria-btn"
                onClick={() =>
                  setProdutos(
                    produtosMock.filter((produto) => produto.categoria === categoria)
                  )
                }
              >
                {categoria}
              </button>
            ))}
          </div>

          <div className="itens">
            <h3>Itens não enviados</h3>
            {produtos.length > 0 ? (
              <div className="produtos-grid">
                {produtos.map((produto) => (
                  <div key={produto.id} className="produto-card">
                    <p>{produto.nome}</p>
                    <p>R$ {produto.preco.toFixed(2)}</p>
                    <button className="add-carrinho">Adicionar</button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum item novo adicionado</p>
            )}
          </div>

          <div className="botoes">
            <button className="voltar" onClick={() => setSelectedMesa(null)}>
              Voltar
            </button>
            <button className="fechar" onClick={handleFecharComandaClick}>
              Fechar Comanda
            </button>
          </div>
        </div>
      )}

      {mostrarFecharComanda && comandaDetalhes && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
            <h2>Fechar Comanda</h2>
            <p>Mesa: {comandaDetalhes.mesa}</p>
            <p>Comanda: {comandaDetalhes.comanda}</p>
            <p>Total: R$ {comandaDetalhes.total.toFixed(2)}</p>
            <p>Data: {comandaDetalhes.dataFechamento}</p>
            <ul>
              {comandaDetalhes.itens.map((item) => (
                <li key={item.id}>
                  {item.nome} - R$ {item.preco.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="botoes">
              <button className="imprimir" onClick={handleImportar}>
                Importar
              </button>
              <button
                className="cancelar"
                onClick={() => setMostrarFecharComanda(false)}
              >
                Cancelar
              </button>
              <button className="confirmar" onClick={handleConfirmarFechamento}>
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IniciarVenda;
