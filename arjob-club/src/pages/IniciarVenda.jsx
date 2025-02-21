import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]); // Estado das mesas
  const navigate = useNavigate();

  // 🔥 Função para buscar as mesas e verificar comandas abertas
  const fetchMesas = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/mesas");
      if (!response.ok) throw new Error("Erro ao carregar mesas");
      
      const mesasData = await response.json();
      
      // 🔥 Busca comandas abertas para cada mesa
      const mesasAtualizadas = await Promise.all(
        mesasData.map(async (mesa) => {
          const comandaResponse = await fetch(`http://127.0.0.1:5000/comandas/mesa/${mesa.id}`);
          const comanda = await comandaResponse.json();
          return {
            ...mesa,
            status: comanda && comanda.id && comanda.status === true, // Se houver comanda aberta, status será true
          };
        })
      );

      // 🔥 Ordena as mesas pelo número
      setMesas(mesasAtualizadas.sort((a, b) => a.numero - b.numero));
    } catch (error) {
      console.error("❌ Erro ao conectar ao servidor:", error);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  // 🔥 Função para selecionar mesa e abrir comanda
  const handleSelecionarMesa = async (mesa) => {
    console.log(`🖱️ Clicou na mesa ${mesa.id}, verificando status...`);

    try {
      const response = await fetch(`http://127.0.0.1:5000/comandas/mesa/${mesa.id}`);
      const comanda = await response.json();

      if (!response.ok) {
        console.error(`❌ Erro ao buscar comanda da mesa ${mesa.id}:`, comanda);
        return;
      }

      if (comanda && comanda.id && comanda.status === true) {
        console.log(`✅ Mesa ${mesa.id} já tem comanda aberta. Redirecionando...`);
        navigate(`/comanda-aberta/${comanda.id}`);
        return;
      }

      console.log(`🔄 Nenhuma comanda encontrada para a mesa ${mesa.id}. Criando nova.`);
      navigate(`/nova-comanda/${mesa.id}`);

      // 🔥 Atualiza estado para refletir a mudança imediatamente
      setMesas((prevMesas) =>
        prevMesas.map((m) => (m.id === mesa.id ? { ...m, status: true } : m))
      );
    } catch (error) {
      console.error(`❌ Erro ao conectar ao servidor para mesa ${mesa.id}:`, error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-screen-lg mx-auto">
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            className={`w-24 h-24 md:w-28 md:h-28 text-lg font-semibold border rounded-lg shadow-md transition-transform ${
              mesa.status ? "bg-red-500 text-white" : "bg-green-500 text-white"
            } hover:scale-105`}
            onClick={() => handleSelecionarMesa(mesa)}
          >
            Mesa {mesa.numero}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IniciarVenda;
