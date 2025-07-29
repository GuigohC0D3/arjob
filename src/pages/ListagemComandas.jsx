import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DetalhesComandaPDF from "./DetalhesComandaPDF";
import DetalhesComandaParcialPDF from "./DetalhesComandaParcialPDF"; // Novo componente para comanda parcial

const ListagemComandas = () => {
  const [comandas, setComandas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroAtendente, setFiltroAtendente] = useState("");
  const [filtroMesa, setFiltroMesa] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [, setModalAberto] = useState(false);

  useEffect(() => {
    const fetchComandas = async () => {
      try {
        const response = await fetch(
          "http://10.11.1.80:5000/comandas?status=fechada"
        );
        if (response.ok) {
          const dados = await response.json();

          const ordenadas = dados.sort(
            (a, b) => new Date(b.data_fechamento) - new Date(a.data_fechamento)
          );

          setComandas(ordenadas);
        } else {
          console.error(
            "Erro ao carregar comandas fechadas:",
            await response.json()
          );
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };

    fetchComandas();
  }, []);

  const itensPorPagina = 6;

  const comandasFiltradas = comandas.filter((comanda) => {
    const clienteMatch = comanda.cliente
      ?.toLowerCase()
      .includes(filtroCliente.toLowerCase());
    const atendenteMatch = comanda.atendente
      ?.toLowerCase()
      .includes(filtroAtendente.toLowerCase());
    const mesaMatch = filtroMesa
      ? String(comanda.mesa).includes(filtroMesa.trim())
      : true;
    const dataFechamento = new Date(comanda.data_fechamento);
    const inicioValido = dataInicio ? new Date(dataInicio) : null;
    const fimValido = dataFim ? new Date(dataFim + "T23:59:59") : null;
    const dataDentroDoIntervalo =
      (!inicioValido || dataFechamento >= inicioValido) &&
      (!fimValido || dataFechamento <= fimValido);

    return clienteMatch && atendenteMatch && mesaMatch && dataDentroDoIntervalo;
  });

  const totalPaginas = Math.ceil(comandasFiltradas.length / itensPorPagina);
  const comandasExibidas = comandasFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const abrirDetalhesComanda = (comanda) => {
    if (!comanda || !comanda.code) {
      console.error("Código da comanda não está definido:", comanda);
      return;
    }

    fetch(`http://127.0.0.1:5000/historico/${comanda.code}/itens`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro na requisição: ${res.status}`);
        }
        return res.json();
      })
      .then((itens) => {
        console.log("Itens da comanda:", itens);
        setComandaSelecionada({
          mesa: comanda.mesa,
          cliente: comanda.cliente,
          cpf: comanda.cpf,
          atendente: comanda.atendente,
          data_fechamento: comanda.data_fechamento,
          total: comanda.total,
          tipos_pagamento: comanda.tipos_pagamento,
          itens: Array.isArray(itens) ? itens : [],
        });

        setModalAberto(true);
      })
      .catch((err) => {
        console.error("Erro ao buscar itens da comanda:", err);
      });
  };

  const fecharModal = () => setComandaSelecionada(null);

  // Função para agrupar itens duplicados
  const deduplicateItems = (items) => {
    return Object.values(
      items.reduce((acc, item) => {
        // Utilize item.id ou item.produto_id (se item.id for único para cada linha) como chave
        const key = item.id;
        if (acc[key]) {
          acc[key].quantidade += item.quantidade;
        } else {
          acc[key] = { ...item };
        }
        return acc;
      }, {})
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Histórico de Comandas Fechadas
        </h1>
      </header>

      {/* Filtros */}
      <section className="mb-6 bg-white p-4 rounded shadow-md max-w-screen-lg mx-auto">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 justify-center">
          <input
            type="text"
            placeholder="Buscar por cliente"
            value={filtroCliente}
            onChange={(e) => {
              setPaginaAtual(1);
              setFiltroCliente(e.target.value);
            }}
            className="border px-3 py-2 rounded w-full sm:w-52"
          />
          <input
            type="text"
            placeholder="Buscar por atendente"
            value={filtroAtendente}
            onChange={(e) => {
              setPaginaAtual(1);
              setFiltroAtendente(e.target.value);
            }}
            className="border px-3 py-2 rounded w-full sm:w-52"
          />
          <input
            type="text"
            placeholder="Buscar por número da mesa"
            value={filtroMesa}
            onChange={(e) => {
              setPaginaAtual(1);
              setFiltroMesa(e.target.value);
            }}
            className="border px-3 py-2 rounded w-full sm:w-40"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-sm text-gray-600">De:</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => {
                setPaginaAtual(1);
                setDataInicio(e.target.value);
              }}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-sm text-gray-600">Até:</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => {
                setPaginaAtual(1);
                setDataFim(e.target.value);
              }}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>
      </section>

      {/* Lista */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-lg mx-auto">
        {comandasExibidas.length > 0 ? (
          comandasExibidas.map((comanda, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-transform hover:scale-[1.02]"
            >
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Mesa: {comanda.mesa}
                </h3>
                <p className="text-gray-600">Cliente: {comanda.cliente}</p>
                <p className="text-gray-600">CPF: {comanda.cpf}</p>
                <p className="text-gray-600">
                  Atendente: {comanda.atendente || "Não informado"}
                </p>
                <p className="text-gray-600">
                  Forma de Pagamento: {comanda.tipos_pagamento}
                </p>
                <p className="text-gray-800 font-medium mt-1">
                  Total: R$ {parseFloat(comanda.total).toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">
                  Data Fechamento:{" "}
                  {comanda.data_fechamento
                    ? new Date(comanda.data_fechamento).toLocaleString()
                    : "Não informada"}
                </p>
              </div>

              <button
                onClick={() => abrirDetalhesComanda(comanda)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Visualizar Detalhes
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            Nenhuma comanda fechada encontrada.
          </p>
        )}
      </main>

      {/* Paginação */}
      {comandasFiltradas.length > 0 && (
        <footer className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
            className={`px-4 py-2 rounded ${
              paginaAtual === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Anterior
          </button>

          <span className="text-gray-700 font-medium">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual === totalPaginas}
            className={`px-4 py-2 rounded ${
              paginaAtual === totalPaginas
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Próxima
          </button>
        </footer>
      )}

      {/* Modal com os detalhes da comanda */}
      {comandaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-100 rounded-lg shadow-lg p-6 w-full max-w-md sm:max-w-lg relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={fecharModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h2 className="text-2xl font-semibold mb-4">Detalhes da Comanda</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Mesa:</strong> {comandaSelecionada.mesa}
              </p>
              <p>
                <strong>Cliente:</strong> {comandaSelecionada.cliente}
              </p>
              <p>
                <strong>CPF:</strong> {comandaSelecionada.cpf}
              </p>
              <p>
                <strong>Atendente:</strong>{" "}
                {comandaSelecionada.atendente || "Não informado"}
              </p>
              <p>
                <strong>Forma de Pagamento:</strong>{" "}
                {comandaSelecionada.tipos_pagamento}
              </p>

              <p>
                <strong>Total:</strong> R${" "}
                {parseFloat(comandaSelecionada.total).toFixed(2)}
              </p>
              <p>
                <strong>Data de Fechamento:</strong>{" "}
                {new Date(comandaSelecionada.data_fechamento).toLocaleString()}
              </p>

              <h3 className="text-lg font-semibold mt-4">Itens:</h3>
              {comandaSelecionada.itens?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {deduplicateItems(comandaSelecionada.itens).map(
                    (item, idx) => (
                      <li key={idx}>
                        {item.nome} - R$
                        {parseFloat(item.preco).toFixed(2)} x{item.quantidade}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-600">Nenhum item encontrado.</p>
              )}
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-base font-medium">Imprimir Comanda:</span>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <PDFDownloadLink
                  document={<DetalhesComandaPDF comanda={comandaSelecionada} />}
                  fileName={`Detalhes_Comanda_${comandaSelecionada.mesa}.pdf`}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold text-base text-center hover:bg-green-700 hover:scale-105 transition-transform duration-200 shadow-sm"
                >
                  {({ loading }) => (loading ? "Gerando PDF..." : "Completa")}
                </PDFDownloadLink>

                <PDFDownloadLink
                  document={
                    <DetalhesComandaParcialPDF comanda={comandaSelecionada} />
                  }
                  fileName={`Parcial_Comanda_${comandaSelecionada.mesa}.pdf`}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-base text-center hover:bg-blue-700 hover:scale-105 transition-transform duration-200 shadow-sm"
                >
                  {({ loading }) =>
                    loading ? "Gerando Parcial..." : "Parcial"
                  }
                </PDFDownloadLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListagemComandas;
