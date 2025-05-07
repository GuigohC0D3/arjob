// NovaComanda.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NovaComanda = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const [atendentes, setAtendentes] = useState([]);
  const [atendenteSelecionado, setAtendenteSelecionado] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAtendentes = async () => {
      try {
        const response = await fetch("http://10.11.1.67:5000/atendentes");
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

  async function verificarComandaAberta(mesaId) {
    try {
      const response = await fetch(`http://10.11.1.67:5000/comandas/mesa/${mesaId}`);
      const data = await response.json();

      if (response.ok && data.comanda && data.comanda.id) {
        console.warn("⚠️ Comanda já existente, redirecionando...");
        navigate(`/comanda-aberta/${data.comanda.id}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Erro ao verificar comanda da mesa:", error);
      return false;
    }
  }

  const handleAbrirComanda = async () => {
    if (!mesaId || !atendenteSelecionado) {
      alert("Erro: Selecione um atendente.");
      return;
    }

    try {
      setLoading(true);
      const existeComanda = await verificarComandaAberta(mesaId);
      if (existeComanda) return;

      const response = await fetch("http://10.11.1.67:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: Number(mesaId),
          usuario_id: Number(atendenteSelecionado),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Erro ao abrir comanda:", responseData);
        alert(`Erro ao abrir comanda: ${responseData.error}`);
        return;
      }

      // Obter o objeto completo do atendente selecionado:
      const atendenteObj = atendentes.find(
        (at) => at.id === Number(atendenteSelecionado)
      );

      console.log("✅ Comanda criada com sucesso:", responseData);
      navigate(`/comanda-aberta/${responseData.id}`, { state: { atendente: atendenteObj } });
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

        <button
          className="w-full mt-6 py-3 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
          onClick={handleAbrirComanda}
          disabled={!atendenteSelecionado || loading}
        >
          {loading ? "Abrindo..." : "Abrir Comanda"}
        </button>
      </div>
    </div>
  );
};

export default NovaComanda;
