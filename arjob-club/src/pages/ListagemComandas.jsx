import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DetalhesComandaPDF from "./DetalhesComandaPDF";
import "./ListagemComandas.css";

const ListagemComandas = () => {
  const [comandas, setComandas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);

  // Carrega as comandas fechadas do backend
  useEffect(() => {
    const fetchComandas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/comandas?status=fechada");
        if (response.ok) {
          setComandas(await response.json());
        } else {
          console.error("Erro ao carregar comandas fechadas:", await response.json());
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };

    fetchComandas();
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
        <h1>Histórico de Comandas Fechadas</h1>
      </header>
      <main>
        {comandasExibidas.length > 0 ? (
          comandasExibidas.map((comanda, index) => (
            <div key={index} className="comanda-card">
              <h3>Mesa: {comanda.mesa}</h3>
              <p>Cliente: {comanda.cliente}</p>
              <p>CPF: {comanda.cpf}</p>
              <p>Atendente: {comanda.atendente || "Não informado"}</p>
              <p>Total: R$ {parseFloat(comanda.total).toFixed(2)}</p>
              <p>Data Fechamento: {new Date(comanda.data_fechamento).toLocaleString()}</p>
              <button onClick={() => setComandaSelecionada(comanda)}>
                Visualizar Detalhes
              </button>
            </div>
          ))
        ) : (
          <p>Nenhuma comanda fechada encontrada.</p>
        )}
      </main>
      {comandas.length > 0 && (
        <footer>
          <button
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
          >
            Anterior
          </button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual === totalPaginas}
          >
            Próxima
          </button>
        </footer>
      )}

      {/* Modal */}
      {comandaSelecionada && (
        <div className={`modal visivel`}>
          <div className="modal-content">
            <h2>Detalhes da Comanda</h2>
            <p><strong>Mesa:</strong> {comandaSelecionada.mesa}</p>
            <p><strong>Cliente:</strong> {comandaSelecionada.cliente}</p>
            <p><strong>CPF:</strong> {comandaSelecionada.cpf}</p>
            <p><strong>Atendente:</strong> {comandaSelecionada.atendente || "Não informado"}</p>
            <p><strong>Total:</strong> R$ {parseFloat(comandaSelecionada.total).toFixed(2)}</p>
            <p><strong>Data de Fechamento:</strong> {new Date(comandaSelecionada.data_fechamento).toLocaleString()}</p>

            <h3>Itens:</h3>
            <ul>
              {comandaSelecionada.itens.map((item, idx) => (
                <li key={idx}>
                  {item.nome} - R$ {parseFloat(item.preco).toFixed(2)} x {item.quantidade}
                </li>
              ))}
            </ul>

            {/* PDFDownloadLink */}
            <PDFDownloadLink
              document={<DetalhesComandaPDF comanda={comandaSelecionada} />}
              fileName={`Detalhes_Comanda_${comandaSelecionada.mesa}.pdf`}
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
