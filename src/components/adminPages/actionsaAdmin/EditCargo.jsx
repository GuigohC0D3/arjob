import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../../../apiConfig";

const EditCargo = ({ userId, currentCargo, onClose, onUpdate }) => {
  const [selectedCargo, setSelectedCargo] = useState(currentCargo);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("authToken");
        if (!token || token.split(".").length !== 3) {
          console.error("❌ Token inválido:", token);
          setError("Erro de autenticação. Faça login novamente.");
          return;
        }

        const response = await api.get("/admin/cargos", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status !== 200) {
          throw new Error(response.data.error || "Erro ao carregar cargos.");
        }

        console.log("✅ Cargos recebidos:", response.data);
        setCargos(response.data);
      } catch (error) {
        console.error("❌ Erro ao buscar cargos:", error);
        setError("Erro ao carregar cargos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCargos();
  }, []);

  const handleSave = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");

      console.log(
        `🔍 Enviando atualização: Usuário ${userId}, Cargo: ${selectedCargo}`
      );

      await api.put(
        `/admin/usuarios/${userId}/cargo`,
        { cargo_id: selectedCargo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onUpdate();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao atualizar cargo:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Editar Cargo</h2>
        {loading ? (
          <p>Carregando cargos...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <select
            value={selectedCargo || ""}
            onChange={(e) => setSelectedCargo(Number(e.target.value))}
            className="border px-4 py-2 rounded-md w-full"
          >
            <option value="" disabled>
              Selecione um cargo
            </option>{" "}
            {/* 🚀 Opção inicial */}
            {cargos.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.nome}
              </option>
            ))}
          </select>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            disabled={loading || !!error}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

EditCargo.propTypes = {
  userId: PropTypes.number.isRequired,
  currentCargo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default EditCargo;
