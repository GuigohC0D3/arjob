import { useState, useEffect } from "react";
import { FaFileAlt, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../apiConfig";

const Relatorio = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroMes, setFiltroMes] = useState("");
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
    </div>
  );
};

export default Relatorio;
