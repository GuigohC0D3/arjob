import { useState } from "react";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [comandas, setComandas] = useState({}); 
  const [novaComanda, setNovaComanda] = useState(""); 
  const [produtos, setProdutos] = useState([]); 
  const categorias = ["Entradas", "Pratos", "Bebidas", "Sobremesas"]; 

  const produtosMock = [
    { id: 1, nome: "Cerveja", preco: 12.0, categoria: "Bebidas" },
    { id: 2, nome: "Coca-Cola", preco: 5.0, categoria: "Bebidas" },
    { id: 3, nome: "Picanha", preco: 45.99, categoria: "Pratos" },
    { id: 4, nome: "Petit Gateau", preco: 20.0, categoria: "Sobremesas" },
  ]; 

  const mesas = Array.from({ length: 20 }, (_, i) => i + 1); 

  const handleMesaClick = (mesa) => {
    if (comandas[mesa]) {
      // Se a mesa já tem comanda, vai para a tela da comanda
      setSelectedMesa(mesa);
    } else {
      // Se a mesa está disponível, abre opção para nova comanda
      setSelectedMesa(mesa);
    }
  };

  const handleAbrirComanda = () => {
    setComandas({ ...comandas, [selectedMesa]: novaComanda });
    setNovaComanda("");
  };

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

      {/* Tela da comanda da mesa */}
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
                onClick={() => {
                  // Lógica para filtrar produtos por categoria
                  setProdutos(
                    produtosMock.filter((produto) => produto.categoria === categoria)
                  );
                }}
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
            <button className="cancelar">Cancelar Venda</button>
          </div>
        </div>
      )}
    </>
  );
};

export default IniciarVenda;
   