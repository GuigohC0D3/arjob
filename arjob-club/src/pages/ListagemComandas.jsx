import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DetalhesComandaPDF from "./DetalhesComandaPDF";
import "./ListagemComandas.css";

const ListagemComandas = () => {
  const [comandas, setComandas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);

  // Carrega as comandas fechadas do localStorage
  useEffect(() => {
    const storedHistorico = localStorage.getItem("historicoComandas");
    if (storedHistorico) {
      setComandas(JSON.parse(storedHistorico));
    }
  }, []);

  const itensPorPagina = 6;
  const totalPaginas = Math.ceil(comandas.length / itensPorPagina);
  const comandasExibidas = comandas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const fecharModal = () => setComandaSelecionada(null);

  return (
    <div className="listagem-comandas-container">
      <header>
        <h1>Listagem de Comandas</h1>
      </header>
      <main>
        {comandasExibidas.length > 0 ? (
          comandasExibidas.map((comanda, index) => (
            <div key={index} className="comanda-card">
              <h3>Mesa: {comanda.mesa}</h3>
              <h3>Comanda: {comanda.comanda}</h3>
              <p>Total: R$ {comanda.total.toFixed(2)}</p>
              <p>Data Fechamento: {comanda.dataFechamento}</p>
              <button onClick={() => setComandaSelecionada(comanda)}>
                Visualizar Detalhes
              </button>
            </div>
          ))
        ) : (
          <p>Nenhuma comanda fechada ainda.</p>
        )}
      </main>
      {comandas.length > 0 && (
        <footer>
          <button onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}>
            Anterior
          </button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
          >
            Próxima
          </button>
        </footer>
      )}

      {/* Modal */}
      <div className={`modal ${comandaSelecionada ? "visivel" : "invisivel"}`}>
        {comandaSelecionada && (
          <div className="modal-content">
            <h2>Detalhes da Comanda</h2>
            <p><strong>Mesa:</strong> {comandaSelecionada.mesa}</p>
            <p><strong>Número da Comanda:</strong> {comandaSelecionada.comanda}</p>
            <p><strong>Total:</strong> R$ {comandaSelecionada.total.toFixed(2)}</p>
            <p><strong>Data de Fechamento:</strong> {comandaSelecionada.dataFechamento}</p>

            <h3>Itens:</h3>
            <ul>
              {comandaSelecionada.itens.map((item) => (
                <li key={item.id}>
                  {item.nome} - R$ {item.preco.toFixed(2)}
                </li>
              ))}
            </ul>

            {/* PDFDownloadLink */}
            <PDFDownloadLink
              document={<DetalhesComandaPDF comanda={comandaSelecionada} />}
              fileName={`Detalhes_Comanda_${comandaSelecionada.comanda}.pdf`}
              className="botao-estilizado"
            >
              {({ loading }) =>
                loading ? "Gerando PDF..." : "Baixar PDF"
              }
            </PDFDownloadLink>

            <button onClick={fecharModal}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListagemComandas;
