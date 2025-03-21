import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DetalhesComandaPDF from "./DetalhesComandaPDF";

const ListagemComandas = () => {
  const [comandas, setComandas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);

  useEffect(() => {
    const fetchComandas = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/comandas?status=fechada"
        );
        if (response.ok) {
          setComandas(await response.json());
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
  const totalPaginas = Math.ceil(comandas.length / itensPorPagina);
  const comandasExibidas = comandas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const abrirDetalhesComanda = async (comanda) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/historico/${comanda.historico_id}/itens`
      );
      const itens = await response.json();

      setComandaSelecionada({
        ...comanda,
        itens: itens || [],
      });
    } catch (error) {
      console.error("Erro ao buscar itens da comanda:", error);
    }
  };

  const fecharModal = () => setComandaSelecionada(null);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Histórico de Comandas Fechadas
        </h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comandasExibidas.length > 0 ? (
          comandasExibidas.map((comanda, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 transition-transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold mb-2">
                Mesa: {comanda.mesa}
              </h3>
              <p className="text-gray-600">Cliente: {comanda.cliente}</p>
              <p className="text-gray-600">CPF: {comanda.cpf}</p>
              <p className="text-gray-600">
                Atendente: {comanda.atendente || "Não informado"}
              </p>
              <p className="text-gray-800 font-medium">
                Total: R$ {parseFloat(comanda.total).toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm">
                Data Fechamento:{" "}
                {new Date(comanda.data_fechamento).toLocaleString()}
              </p>

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

      {comandas.length > 0 && (
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

      {/* Modal */}
      {comandaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              onClick={fecharModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h2 className="text-2xl font-semibold mb-4">Detalhes da Comanda</h2>
            <div className="space-y-2">
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
                <strong>Total:</strong> R${" "}
                {parseFloat(comandaSelecionada.total).toFixed(2)}
              </p>
              <p>
                <strong>Data de Fechamento:</strong>{" "}
                {new Date(comandaSelecionada.data_fechamento).toLocaleString()}
              </p>

              <h3 className="text-lg font-semibold mt-4">Itens:</h3>
              {comandaSelecionada.itens &&
              comandaSelecionada.itens.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {comandaSelecionada.itens.map((item, idx) => (
                    <li key={idx} className="text-gray-700">
                      {item.nome} - R${" "}
                      {parseFloat(item.preco_unitario).toFixed(2)} x{" "}
                      {item.quantidade}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Nenhum item encontrado.</p>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <PDFDownloadLink
                document={<DetalhesComandaPDF comanda={comandaSelecionada} />}
                fileName={`Detalhes_Comanda_${comandaSelecionada.mesa}.pdf`}
                className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                {({ loading }) => (loading ? "Gerando PDF..." : "Baixar PDF")}
              </PDFDownloadLink>

              <button
                onClick={fecharModal}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListagemComandas;
