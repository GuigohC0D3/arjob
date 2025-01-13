import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DetalhesComandaPDF from "./DetalhesComandaPDF";
import "./ListagemComandas.css";

const ListagemComandas = () => {
  const [comandas, setComandas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);

  const itensPorPagina = 6;

  useEffect(() => {
    const fetchComandasFechadas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/comandas/fechadas");
        if (response.ok) {
          const data = await response.json();
          setComandas(data);
        } else {
          console.error("Erro ao carregar comandas fechadas.");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };

    fetchComandasFechadas();
  }, []);

  const totalPaginas = Math.ceil(comandas.length / itensPorPagina);
  const comandasExibidas = comandas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const fecharModal = () => setComandaSelecionada(null);

  return (
    <div className="listagem-comandas-container">
      <header>
        <h1>Histórico de Comandas</h1>
      </header>
      <main>
        {comandasExibidas.length > 0 ? (
          comandasExibidas.map((comanda, index) => {
            const total = parseFloat(comanda.total) || 0; // Garante que o total seja um número válido
            return (
              <div key={index} className="comanda-card">
                <h3>Mesa: {comanda.mesa_numero}</h3>
                <p>Total: R$ {total.toFixed(2)}</p>
                <p>
                  Data Fechamento:{" "}
                  {new Date(comanda.data_fechamento).toLocaleString()}
                </p>
                <button onClick={() => setComandaSelecionada(comanda)}>
                  Visualizar Detalhes
                </button>
              </div>
            );
          })
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

      {comandaSelecionada && (
        <div className="modal visivel">
          <div className="modal-content">
            <h2>Detalhes da Comanda</h2>
            <p><strong>Mesa:</strong> {comandaSelecionada.mesa_numero}</p>
            <p>
              <strong>Total:</strong>{" "}
              R$ {parseFloat(comandaSelecionada.total || 0).toFixed(2)}
            </p>
            <p>
              <strong>Data de Fechamento:</strong>{" "}
              {new Date(comandaSelecionada.data_fechamento).toLocaleString()}
            </p>

            <h3>Itens:</h3>
            <ul>
              {comandaSelecionada.itens.map((item, idx) => (
                <li key={idx}>
                  {item.nome} - R$ {parseFloat(item.preco || 0).toFixed(2)} x{" "}
                  {item.quantidade}
                </li>
              ))}
            </ul>

            <PDFDownloadLink
              document={<DetalhesComandaPDF comanda={comandaSelecionada} />}
              fileName={`Detalhes_Comanda_${comandaSelecionada.numero}.pdf`}
              className="botao-estilizado"
            >
              {({ loading }) => (loading ? "Gerando PDF..." : "Baixar PDF")}
            </PDFDownloadLink>

            <button onClick={fecharModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListagemComandas;
