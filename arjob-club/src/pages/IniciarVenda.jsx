import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]);
  const navigate = useNavigate();

  // ✅ Função para buscar mesas e verificar se há comanda aberta para cada uma
  const fetchMesas = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/mesas");
      if (!response.ok) throw new Error("Erro ao carregar mesas");

      const mesasData = await response.json();

      // 🔍 Busca se cada mesa tem uma comanda aberta
      const mesasAtualizadas = await Promise.all(
        mesasData.map(async (mesa) => {
          try {
            const comandaResponse = await fetch(
              `http://127.0.0.1:5000/comandas/mesa/${mesa.id}`
            );

            if (!comandaResponse.ok) {
              console.warn(`⚠️ Mesa ${mesa.id} sem resposta de comanda`);
              return mesa; // Sem comanda, sem alteração
            }

            const comandaData = await comandaResponse.json();

            const temComandaAberta =
              comandaData &&
              comandaData.comanda &&
              comandaData.comanda.status === true;

            return {
              ...mesa,
              status: temComandaAberta, // true = mesa ocupada (vermelha)
              comandaId: temComandaAberta ? comandaData.comanda.id : null, // Armazena o id da comanda se aberta
            };
          } catch (error) {
            console.error(
              `❌ Erro ao buscar comanda da mesa ${mesa.id}:`,
              error
            );
            return mesa; // Continua sem modificação se der erro
          }
        })
      );

      // Atualiza estado das mesas no frontend
      setMesas(mesasAtualizadas.sort((a, b) => a.numero - b.numero));
    } catch (error) {
      console.error("❌ Erro ao buscar mesas:", error);
    }
  };

  // ✅ Ao montar componente, busca as mesas
  useEffect(() => {
    fetchMesas();
  }, []);

  // ✅ Função para clicar em uma mesa
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

      // Atualiza localmente o status da mesa pra ocupada 
      setMesas((prevMesas) =>
        prevMesas.map((m) => (m.id === mesa.id ? { ...m, status: true } : m))
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
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

      <div className="fixed bottom-6 right-6">
        <button
          onClick={fetchMesas}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition"
        >
          Atualizar Mesas
        </button>
      </div>
    </div>
  );
};

export default IniciarVenda;
