import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [quantidadeMesas, setQuantidadeMesas] = useState(1);
  const navigate = useNavigate();

  const fetchMesas = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/mesas");
      if (!response.ok) throw new Error("Erro ao carregar mesas");

      const mesasData = await response.json();

      const mesasAtualizadas = await Promise.all(
        mesasData.map(async (mesa) => {
          try {
            const comandaResponse = await fetch(
              `http://127.0.0.1:5000/comandas/mesa/${mesa.id}`
            );

            if (!comandaResponse.ok) {
              console.warn(`⚠️ Mesa ${mesa.id} sem resposta de comanda`);
              return mesa;
            }

            const comandaData = await comandaResponse.json();

            const temComandaAberta =
              comandaData &&
              comandaData.comanda &&
              comandaData.comanda.status === true;

            return {
              ...mesa,
              status: temComandaAberta,
              comandaId: temComandaAberta ? comandaData.comanda.id : null,
            };
          } catch (error) {
            console.error(
              `❌ Erro ao buscar comanda da mesa ${mesa.id}:`,
              error
            );
            return mesa;
          }
        })
      );

      setMesas(mesasAtualizadas.sort((a, b) => a.numero - b.numero));
    } catch (error) {
      console.error("❌ Erro ao buscar mesas:", error);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const handleSelecionarMesa = async (mesa) => {
    console.log(`🖱️ Clicou na mesa ${mesa.numero}`);

    if (mesa.status && mesa.comandaId) {
      console.log(
        `✅ Mesa ${mesa.numero} já tem comanda aberta, id: ${mesa.comandaId}`
      );
      navigate(`/comanda-aberta/${mesa.comandaId}`);
    } else {
      console.log(
        `🆕 Mesa ${mesa.numero} sem comanda, iniciando fluxo de abertura.`
      );
      navigate(`/nova-comanda/${mesa.id}`);

      setMesas((prevMesas) =>
        prevMesas.map((m) => (m.id === mesa.id ? { ...m, status: true } : m))
      );
    }
  };

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setQuantidadeMesas(1);
    setModalAberto(false);
  };

  const adicionarNovasMesas = async () => {
    try {
      await fetch("http://127.0.0.1:5000/mesas/adicionar", {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Botão para abrir modal */}
      <button
        onClick={abrirModal}
        className="mb-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
      >
        + Adicionar Mesas
      </button>

      {/* Modal */}
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

      {/* Mesas */}
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
