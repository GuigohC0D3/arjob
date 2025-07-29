import { useState, useEffect } from "react";
import { FaFileAlt, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../apiConfig";

const Relatorio = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroMes, setFiltroMes] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const itemsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/relatorios")
      .then((res) => {
        console.log("Relatórios carregados:", res.data);
        setDados(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const abrirModalRelatorio = (cliente) => {
    console.log("Abrindo relatório modal para:", cliente);
    setClienteSelecionado(cliente);
    setMostrarModal(true);
  };

  const abrirRelatorioPrevisto = (cliente) => {
    const [mes, ano] = cliente.mes_fechamento.split("/");
    console.log("Navegando para relatório detalhado com:", {
      cpf: cliente.cpf,
      mes,
      ano,
    });

    navigate("/relatorio_detalhado", {
      state: {
        cpf: cliente.cpf,
        mes,
        ano,
      },
    });
  };

  const dadosFiltrados = filtroMes
    ? dados.filter((item) => {
        const [mes, ano] = item.mes_fechamento.split("/");
        const filtroAno = filtroMes.slice(0, 4);
        const filtroMesNum = filtroMes.slice(5, 7);
        return mes === filtroMesNum && ano === filtroAno;
      })
    : dados;

  const totalPages = Math.ceil(dadosFiltrados.length / itemsPerPage);
  const currentItems = dadosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full mx-auto p-10 relative">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
        Relatório Mensal dos Clientes
      </h1>

      <div className="flex justify-center items-center mb-6 gap-4">
        <label className="mr-4 text-gray-700 font-semibold">
          Filtrar por mês:
        </label>
        <input
          type="month"
          className="border border-gray-300 rounded px-3 py-2"
          value={filtroMes}
          onChange={(e) => {
            setCurrentPage(1);
            setFiltroMes(e.target.value);
          }}
        />
      </div>

      <div className="shadow-xl rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#094067] text-white text-left text-base">
              <th className="px-6 py-4">CPF</th>
              <th className="px-6 py-4">Nome Completo</th>
              <th className="px-6 py-4">Mês Fechamento</th>
              <th className="px-6 py-4">Valor Total Fechado</th>
              <th className="px-6 py-4 text-center">Relatório</th>
            </tr>
          </thead>
          <tbody className="text-base">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-14">
                  Carregando...
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr
                  key={`${item.cpf}-${item.mes_fechamento}`}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="px-6 py-4 break-words">{item.cpf}</td>
                  <td className="px-6 py-4 break-words">{item.nome}</td>
                  <td className="px-6 py-4">{item.mes_fechamento}</td>
                  <td className="px-6 py-4">
                    R$ {item.valor_total.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => abrirModalRelatorio(item)}
                        className="text-blue-600 hover:text-blue-800 transition text-xl"
                        title="Abrir Relatório Fechado"
                      >
                        <FaFileAlt />
                      </button>
                      <button
                        onClick={() => abrirRelatorioPrevisto(item)}
                        className="text-green-600 hover:text-green-800 transition text-xl"
                        title="Abrir Relatório Previsto"
                      >
                        <FaTasks />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-14 text-gray-500">
                  Nenhum relatório encontrado para o filtro selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-6 mt-10">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className={`px-5 py-3 rounded-md text-lg ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 transition"
            }`}
          >
            Anterior
          </button>
          <span className="font-semibold text-gray-700 text-xl">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className={`px-5 py-3 rounded-md text-lg ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 transition"
            }`}
          >
            Próximo
          </button>
        </div>
      )}

      {/* MODAL */}
      {mostrarModal && clienteSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-xl shadow-lg relative">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center">
              Relatório para Assinatura
            </h2>
            <p>
              <strong>CPF:</strong> {clienteSelecionado.cpf}
            </p>
            <p>
              <strong>Nome:</strong> {clienteSelecionado.nome}
            </p>
            <p>
              <strong>Mês:</strong> {clienteSelecionado.mes_fechamento}
            </p>
            <p>
              <strong>Total:</strong> R${" "}
              {clienteSelecionado.valor_total.toFixed(2).replace(".", ",")}
            </p>

            <div className="my-6 border-t border-gray-400"></div>
            <div className="h-24 border-b border-gray-600 mb-2"></div>
            <p className="text-center font-semibold">Assinatura do Cliente</p>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              >
                Imprimir
              </button>
              <button
                onClick={() =>
                  alert("Assinatura digital ainda não implementada")
                }
                className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
              >
                Assinar Digital
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorio;
