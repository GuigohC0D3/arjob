import { useState } from "react";
import "./ListagemComandas.css"

const ListagemComandas = () => {
  // Definindo o JSON diretamente no componente
  const comandas = [
    {
      "cpf": "12345678901",
      "filial": "Filial 1",
      "convenio": "Convênio A",
      "status": "Fechada"
    },
    {
      "cpf": "23456789012",
      "filial": "Filial 2",
      "convenio": "Convênio B",
      "status": "Aberta"
    },
    {
      "cpf": "34567890123",
      "filial": "Filial 3",
      "convenio": "Convênio C",
      "status": "Fechada"
    },
    {
      "cpf": "45678901234",
      "filial": "Filial 4",
      "convenio": "Convênio D",
      "status": "Aberta"
    },
    {
      "cpf": "56789012345",
      "filial": "Filial 5",
      "convenio": "Convênio E",
      "status": "Fechada"
    },
    {
      "cpf": "67890123456",
      "filial": "Filial 6",
      "convenio": "Convênio F",
      "status": "Aberta"
    },
    {
      "cpf": "78901234567",
      "filial": "Filial 7",
      "convenio": "Convênio G",
      "status": "Fechada"
    },
    {
      "cpf": "89012345678",
      "filial": "Filial 8",
      "convenio": "Convênio H",
      "status": "Aberta"
    },
    {
      "cpf": "90123456789",
      "filial": "Filial 9",
      "convenio": "Convênio I",
      "status": "Fechada"
    },
    {
      "cpf": "10123456789",
      "filial": "Filial 10",
      "convenio": "Convênio J",
      "status": "Aberta"
    },
    {
      "cpf": "11123456789",
      "filial": "Filial 11",
      "convenio": "Convênio K",
      "status": "Fechada"
    },
    {
      "cpf": "12123456789",
      "filial": "Filial 12",
      "convenio": "Convênio L",
      "status": "Aberta"
    }
  ];

  const [paginaAtual, setPaginaAtual] = useState(1);
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
            <button
              onClick={() => alert(JSON.stringify(comanda, null, 2))}
            >
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
    </div>
  );
};

export default ListagemComandas;
