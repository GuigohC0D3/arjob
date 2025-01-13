import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DetalhesComandaPDF from "./DetalhesComandaPDF";
import "./ListagemComandas.css";

const ListagemComandas = () => {
  const [comandas, setComandas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);

  const itensPorPagina = 6;
  const totalPaginas = Math.ceil(comandas.length / itensPorPagina);
  const comandasExibidas = comandas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Buscar comandas fechadas do backend
  useEffect(() => {
    const fetchComandas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/comandas/fechadas");
        if (response.ok) {
          const data = await response.json();
          setComandas(data);
        } else {
          console.error("Erro ao buscar comandas fechadas");
        }
      } catch (error) {
        console.error("Erro ao conectar ao backend:", error);
      }
    };

    fetchComandas();
  }, []);

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
              <h3>Comanda: {comanda.numero_comanda}</h3>
              <p>Total: R$ {comanda.total.toFixed(2)}</p>
              <p>Data Fechamento: {new Date(comanda.data_fechamento).toLocaleString()}</p>
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
            <p><strong>Número da Comanda:</strong> {comandaSelecionada.numero_comanda}</p>
            <p><strong>Total:</strong> R$ {comandaSelecionada.total.toFixed(2)}</p>
            <p><strong>Data de Fechamento:</strong> {new Date(comandaSelecionada.data_fechamento).toLocaleString()}</p>

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
              fileName={`Detalhes_Comanda_${comandaSelecionada.numero_comanda}.pdf`}
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
