import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../apiConfig";

const RelatorioDetalhado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cpf, mes, ano } = location.state || {};

  const [cliente, setCliente] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!cpf || !mes || !ano) return;

    console.log(`🔍 Buscando consumo do cliente ${cpf} para ${mes}/${ano}`);
    setLoading(true);

    // busca dados do cliente
    api
      .get(`/clientes/${cpf}`)
      .then((res) => {
        console.log("Cliente encontrado:", res.data);
        setCliente(res.data[0]); // supondo que é array
      })
      .catch((err) => console.error("Erro ao buscar cliente:", err));

    // busca os itens do consumo do mês
    api
      .get(`/relatorios/cliente/${cpf}?mes=${mes}&ano=${ano}`)
      .then((res) => {
        console.log("Itens do mês:", res.data);
        setItens(res.data);
        setCurrentPage(1);
      })
      .catch((err) => console.error("Erro ao buscar itens:", err))
      .finally(() => setLoading(false));
  }, [cpf, mes, ano]);

  const handlePrint = () => window.print();

  const totalPages = Math.ceil(itens.length / itemsPerPage);
  const currentItems = itens.slice(
    (currentPage - 1) * itemsPerPage,   
    currentPage * itemsPerPage
  );

  // calculo total geral
  const totalGeral = itens.reduce((acc, item) => acc + item.total_item, 0);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl font-bold mr-4"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold">
          Detalhes do consumo em {mes}/{ano}
        </h2>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-sm">
          CPF: {cliente?.cpf ?? "N/A"}
        </span>
        <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-sm">
          Nome: {cliente?.nome ?? "N/A"}
        </span>
        <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-sm">
          Filial: {cliente?.filial ?? "N/A"}
        </span>
        <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-sm">
          Convênio: {cliente?.convenio ?? "N/A"}
        </span>
      </div>

      <div className="bg-white rounded-md shadow p-6 mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="px-4 py-3 text-center">Comanda</th>
              <th className="px-4 py-3 text-center">Data / Hora</th>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-center">Qtd</th>
              <th className="px-4 py-3 text-center">Preço Unit</th>
              <th className="px-4 py-3 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  Carregando...
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-3 text-center">{item.comanda_id}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(item.data_fechamento).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-left">{item.produto_nome}</td>
                  <td className="px-4 py-3 text-center">{item.quantidade}</td>
                  <td className="px-4 py-3 text-center">
                    R$ {item.preco_unitario.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    R$ {item.total_item.toFixed(2).replace(".", ",")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Nenhum item encontrado no mês selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-6 mt-6">
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

      <div className="flex justify-between items-center mt-10 mb-6">
        <div>
          <div className="w-48 border-t-2 border-gray-600 mb-2"></div>
          <p className="font-semibold text-lg">Assinatura do Colaborador</p>
        </div>
        <div className="text-xl font-bold">
          Total: R$ {totalGeral.toFixed(2).replace(".", ",")}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Imprimir Relatório
        </button>
      </div>
    </div>
  );
};

export default RelatorioDetalhado;
