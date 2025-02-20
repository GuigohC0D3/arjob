import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NovaComanda = () => {
  const { mesaId } = useParams(); // Pega o ID da mesa da URL
  const navigate = useNavigate();
  const [atendentes, setAtendentes] = useState([]);
  const [atendenteSelecionado, setAtendenteSelecionado] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Estado de carregamento

  useEffect(() => {
    const fetchAtendentes = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/atendentes");
        if (response.ok) {
          const data = await response.json();
          setAtendentes(data);
        } else {
          console.error("❌ Erro ao buscar atendentes.");
        }
      } catch (error) {
        console.error("❌ Erro ao conectar ao servidor:", error);
      }
    };

    fetchAtendentes();
  }, []);

  // 🔥 Função para verificar se já existe uma comanda aberta para a mesa
  async function verificarComandaAberta(mesaId) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/comandas/mesa/${mesaId}`);
      const data = await response.json();

      if (response.ok && data.id) {
        console.warn("⚠️ Comanda já existente, redirecionando...");
        navigate(`/comanda-aberta/${data.id}`);
        return true;
      }
      return false; // 🔥 Retorna `false` se a mesa não tiver comanda aberta
    } catch (error) {
      console.error("❌ Erro ao verificar comanda da mesa:", error);
      return false;
    }
  }

  const handleAbrirComanda = async () => {
    if (!mesaId) {
      alert("Erro: Nenhuma mesa selecionada.");
      return;
    }

    if (!atendenteSelecionado) {
      alert("Erro: Nenhum atendente selecionado.");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Se já existir comanda aberta, sai da função
      const existeComanda = await verificarComandaAberta(mesaId);
      if (existeComanda) return;

      // 🔥 Se não existir, cria uma nova comanda
      const response = await fetch("http://127.0.0.1:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: Number(mesaId),
          usuario_id: Number(atendenteSelecionado),
          status: true, // ✅ Garantindo que a comanda seja aberta
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Erro ao abrir comanda:", responseData);
        alert(`Erro ao abrir comanda: ${responseData.error}`);
        return;
      }

      console.log("✅ Comanda criada com sucesso:", responseData);
      navigate(`/comanda-aberta/${responseData.id}`);

    } catch (error) {
      console.error("❌ Erro ao conectar ao servidor:", error);
      alert("Erro de conexão com o servidor ao abrir a comanda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10 px-6 md:px-12">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-700 text-center">
          Abrir Comanda - Mesa {mesaId}
        </h2>

        {/* Seleção de Atendente */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Selecione um Atendente
          </label>
          <select
            value={atendenteSelecionado}
            onChange={(e) => setAtendenteSelecionado(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Selecione --</option>
            {atendentes.length > 0 ? (
              atendentes.map((atendente) => (
                <option key={atendente.id} value={atendente.id}>
                  {atendente.nome}
                </option>
              ))
            ) : (
              <option value="">Nenhum atendente disponível</option>
            )}
          </select>
        </div>

        {/* Botão de Abertura da Comanda */}
        <button
          className="w-full mt-6 py-3 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
          onClick={handleAbrirComanda}
          disabled={!atendenteSelecionado || loading} // ✅ Evita clique duplo
        >
          {loading ? "Abrindo..." : "Abrir Comanda"}
        </button>
      </div>
    </div>
  );
};

export default NovaComanda;
