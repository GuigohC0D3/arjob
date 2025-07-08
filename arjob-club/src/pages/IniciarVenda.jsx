import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [quantidadeMesas, setQuantidadeMesas] = useState(1);

  const [modalRemoverAberto, setModalRemoverAberto] = useState(false);
  const [quantidadeRemover, setQuantidadeRemover] = useState(1);

  const navigate = useNavigate();

  const fetchMesas = async () => {
    try {
      const response = await fetch("http://10.11.1.80:5000/mesas");
      if (!response.ok) throw new Error("Erro ao carregar mesas");

      const mesasData = await response.json();

      const mesasAtualizadas = await Promise.all(
        mesasData.map(async (mesa) => {
          try {
            const comandaResponse = await fetch(
              `http://10.11.1.80:5000/comandas/mesa/${mesa.id}`
            );

            if (!comandaResponse.ok) {
              if (comandaResponse.status === 404) {
                return { ...mesa, status: false, comandaId: null };
              } else {
                throw new Error(`Erro ${comandaResponse.status}`);
              }
            }

            const comandaData = await comandaResponse.json();
            const temComandaAberta = comandaData && comandaData.status === true;

            return {
              ...mesa,
              status: temComandaAberta,
              comandaId: temComandaAberta ? comandaData.id : null,
            };
          } catch (error) {
            return { ...mesa, status: false, comandaId: null, error };
          }
        })
      );

      setMesas(mesasAtualizadas.sort((a, b) => a.numero - b.numero));
    } catch (error) {
      console.error("Erro ao buscar mesas:", error);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const adicionarNovasMesas = async () => {
    try {
      await fetch("http://10.11.1.80:5000/mesas/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: parseInt(quantidadeMesas) }),
      });

      fecharModal();
      await fetchMesas();
    } catch (error) {
      console.error("❌ Erro ao adicionar novas mesas:", error);
    }
  };

  const removerMesas = async (quantidade) => {
    try {
      await fetch("http://10.11.1.80:5000/mesas/remover", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: parseInt(quantidade) }),
      });

      fecharModalRemover();
      await fetchMesas();
    } catch (error) {
      console.error("❌ Erro ao remover mesas:", error);
    }
  };

  const handleSelecionarMesa = (mesa) => {
    if (mesa.status && mesa.comandaId) {
      navigate(`/comanda-aberta/${mesa.comandaId}`);
    } else {
      navigate(`/nova-comanda/${mesa.id}`);
    }
  };

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setQuantidadeMesas(1);
    setModalAberto(false);
  };

  const abrirModalRemover = () => setModalRemoverAberto(true);
  const fecharModalRemover = () => {
    setQuantidadeRemover(1);
    setModalRemoverAberto(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <button
        onClick={abrirModal}
        className="mb-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
      >
        + Adicionar Mesas
      </button>

      <button
        onClick={abrirModalRemover}
        className="mb-6 px-6 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
      >
        - Remover Mesas
      </button>

      {/* Modal Adicionar Mesas */}
      <Modal
        isOpen={modalAberto}
        onRequestClose={fecharModal}
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
      >
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Quantas mesas deseja adicionar?
        </h2>
        <input
          type="number"
          min={1}
          value={quantidadeMesas}
          onChange={(e) => setQuantidadeMesas(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={fecharModal}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={adicionarNovasMesas}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Adicionar
          </button>
        </div>
      </Modal>

      {/* Modal Remover Mesas */}
      <Modal
        isOpen={modalRemoverAberto}
        onRequestClose={fecharModalRemover}
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
      >
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Quantas mesas deseja remover?
        </h2>
        <input
          type="number"
          min={1}
          value={quantidadeRemover}
          onChange={(e) => setQuantidadeRemover(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={fecharModalRemover}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={() => removerMesas(quantidadeRemover)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Remover
          </button>
        </div>
      </Modal>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-screen-lg mx-auto">
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => handleSelecionarMesa(mesa)}
            className={`w-24 h-24 md:w-28 md:h-28 flex items-center justify-center text-lg font-semibold border rounded-lg shadow-md transition-transform hover:scale-105 ${
              mesa.status
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Mesa {mesa.numero}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IniciarVenda;
