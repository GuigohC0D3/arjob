import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [comandas, setComandas] = useState({});
  const [novaComanda, setNovaComanda] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [historicoComandas, setHistoricoComandas] = useState([]);
  const [mostrarFecharComanda, setMostrarFecharComanda] = useState(false);

  const categorias = ["Entradas", "Pratos", "Bebidas", "Sobremesas"];

  const produtosMock = [
    { id: 1, nome: "Cerveja", preco: 12.0, categoria: "Bebidas" },
    { id: 2, nome: "Coca-Cola", preco: 5.0, categoria: "Bebidas" },
    { id: 3, nome: "Picanha", preco: 45.99, categoria: "Pratos" },
    { id: 4, nome: "Petit Gateau", preco: 20.0, categoria: "Sobremesas" },
  ];

  const mesas = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleAbrirComanda = () => {
    setComandas({ ...comandas, [selectedMesa]: novaComanda });
    setNovaComanda("");
  };

  const handleFecharComanda = () => {
    const comandaFechada = {
      mesa: selectedMesa,
      comanda: comandas[selectedMesa],
      total: 340.0,
      dataFechamento: new Date(),
    };
    setHistoricoComandas([...historicoComandas, comandaFechada]);

    const novasComandas = { ...comandas };
    delete novasComandas[selectedMesa];
    setComandas(novasComandas);

    setMostrarFecharComanda(false);
    setSelectedMesa(null);
  };

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      {/* Tela principal: Seleção de mesa */}
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

      {/* Tela de nova comanda */}
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

      {/* Tela da comanda da mesa (para imprimir) */}
      {selectedMesa && comandas[selectedMesa] && (
        <div className="comanda-mesa" ref={componentRef}>
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
            <button className="dividir">Dividir Conta</button>
            <button
              className="fechar"
              onClick={() => setMostrarFecharComanda(true)}
            >
              Fechar Comanda
            </button>
          </div>
        </div>
      )}

      {/* Modal para fechar comanda */}
      {mostrarFecharComanda && (
        <div className="modal">
          <h2>Fechar Comanda</h2>
          <p>Deseja imprimir a comanda ou baixar em PDF?</p>
          <div className="botoes">
            <button className="imprimir" onClick={handlePrint}>
              Imprimir
            </button>
            <button
              className="pdf"
              onClick={() => alert("Comanda baixada em PDF!")}
            >
              Baixar PDF
            </button>
            <button
              className="cancelar"
              onClick={() => setMostrarFecharComanda(false)}
            >
              Cancelar
            </button>
          </div>
          <button className="confirmar" onClick={handleFecharComanda}>
            Confirmar Fechamento
          </button>
        </div>
      )}
    </>
  );
};

export default IniciarVenda;
