import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import "./ListagemComandas.css";

const ListagemComandas = () => {
  const comandas = [
    {
      cpf: "12345678901",
      filial: "Filial 1",
      convenio: "Convênio A",
      status: "Fechada",
      colaborador: "João Silva",
      consumido: [
        { item: "Cerveja", quantidade: 2, valor: 10.0 },
        { item: "Batata Frita", quantidade: 1, valor: 20.0 },
      ],
      contaDividida: false,
    },
    {
      cpf: "23456789012",
      filial: "Filial 2",
      convenio: "Convênio B",
      status: "Aberta",
      colaborador: "Maria Oliveira",
      consumido: [
        { item: "Refrigerante", quantidade: 3, valor: 15.0 },
        { item: "Pizza", quantidade: 1, valor: 30.0 },
      ],
      contaDividida: true,
    },
  ];

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);
  const printRef = useRef();

  const itensPorPagina = 6;
  const totalPaginas = Math.ceil(comandas.length / itensPorPagina);
  const comandasExibidas = comandas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const mudarPagina = (novaPagina) => {
    if (novaPagina > 0 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  const fecharModal = () => {
    setComandaSelecionada(null);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Detalhes_Comanda_${comandaSelecionada?.cpf}`,
  });

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(comandaSelecionada, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Detalhes_Comanda_${comandaSelecionada?.cpf}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="listagem-comandas-container">
      <header>
        <h1>Listagem de Comandas</h1>
      </header>
      <main className="main">
        {comandasExibidas.map((comanda, index) => (
          <div key={index} className="comanda-card">
            <h3>CPF: {comanda.cpf}</h3>
            <p>Filial: {comanda.filial}</p>
            <p>Convênio: {comanda.convenio}</p>
            <p>Status: {comanda.status}</p>
            <button onClick={() => setComandaSelecionada(comanda)}>
              Visualizar Detalhes
            </button>
          </div>
        ))}
      </main>
      <footer>
        <button onClick={() => mudarPagina(paginaAtual - 1)}>Anterior</button>
        <span>
          Página {paginaAtual} de {totalPaginas}
        </span>
        <button onClick={() => mudarPagina(paginaAtual + 1)}>Próxima</button>
      </footer>

      {comandaSelecionada && (
        <div className="modal">
          <div className="modal-content" ref={printRef}>
            <h2>Detalhes da Comanda</h2>
            <p><strong>CPF:</strong> {comandaSelecionada.cpf}</p>
            <p><strong>Filial:</strong> {comandaSelecionada.filial}</p>
            <p><strong>Convênio:</strong> {comandaSelecionada.convenio}</p>
            <p><strong>Status:</strong> {comandaSelecionada.status}</p>
            <p><strong>Colaborador:</strong> {comandaSelecionada.colaborador}</p>
            <p>
              <strong>Conta Dividida:</strong>{" "}
              {comandaSelecionada.contaDividida ? "Sim" : "Não"}
            </p>
            <h3>Itens Consumidos:</h3>
            <ul>
              {comandaSelecionada.consumido.map((item, index) => (
                <li key={index}>
                  {item.quantidade}x {item.item} - R$ {item.valor.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <button onClick={handlePrint}>Imprimir</button>
              <button onClick={handleDownload}>Baixar</button>
              <button onClick={fecharModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListagemComandas;
