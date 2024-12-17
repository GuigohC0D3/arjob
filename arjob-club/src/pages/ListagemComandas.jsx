import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DetalhesComandaPDF from "./DetalhesComandaPDF";
import "./ListagemComandas.css";

const ListagemComandas = () => {
  const comandas = [
    {
      cpf: "02161721011",
      filial: "Filial 1",
      convenio: "Convênio C",
      status: "Fechada",
      colaborador: "Guilherme Werneck",
      consumido: [
        { item: "Cerveja", quantidade: 2, valor: 10.0 },
        { item: "Batata Frita", quantidade: 1, valor: 20.0 },
      ],
      total: "R$40,00",
      contaDividida: false,
    },
    {
      cpf: "18673384087",
      filial: "Filial 2",
      convenio: "Convênio B",
      status: "Aberta",
      colaborador: "Daniel Silva",
      consumido: [
        { item: "Cerveja", quantidade: 2, valor: 10.0 },
        { item: "Batata Frita", quantidade: 1, valor: 20.0 },
      ],
      total: "R$40,00",
      contaDividida: false,
    },
    {
      cpf: "37898181000",
      filial: "Filial 3",
      convenio: "Convênio A",
      status: "Fechada",
      colaborador: "João Gabriel",
      consumido: [
        { item: "Cerveja", quantidade: 2, valor: 10.0 },
        { item: "Batata Frita", quantidade: 1, valor: 20.0 },
      ],
      total: "R$40,00",
      contaDividida: true,
    },
    // Adicione mais dados de comandas conforme necessário
  ];

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);

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
        {comandasExibidas.map((comanda, index) => (
          <div key={index} className="comanda-card">
            <h3>Nome: {comanda.colaborador}</h3>
            <h3>CPF: {comanda.cpf}</h3>
            <button onClick={() => setComandaSelecionada(comanda)}>
              Visualizar Detalhes
            </button>
          </div>
        ))}
      </main>
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

      {/* Modal */}
      <div
        className={`modal ${comandaSelecionada ? "visivel" : "invisivel"}`}
      >
        {comandaSelecionada && (
          <div className="modal-content">
            <h2>Detalhes da Comanda</h2>
            <p><strong>Colaborador:</strong> {comandaSelecionada.colaborador}</p>
            <p><strong>CPF:</strong> {comandaSelecionada.cpf}</p>
            <h3>Itens Consumidos:</h3>
            <ul>
              {comandaSelecionada.consumido.map((item, index) => (
                <li key={index}>
                  {item.quantidade}x {item.item} - R$ {item.valor.toFixed(2)}
                </li>
              ))}
            </ul>
            <h3>Valor total: {comandaSelecionada.total}</h3>

            {/* PDFDownloadLink */}
            <PDFDownloadLink
              document={<DetalhesComandaPDF comanda={comandaSelecionada} />}
              fileName={`Detalhes_Comanda_${comandaSelecionada.cpf}.pdf`}
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
