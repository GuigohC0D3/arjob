import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../../../apiConfig";

const EditStatus = ({
  entityId,
  currentStatusId,
  entityType, // "usuarios" ou "clientes"
  statusOptions,
  onClose,
  onUpdate,
}) => {
  const [statusId, setStatusId] = useState(currentStatusId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatusId(currentStatusId);
  }, [currentStatusId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");

      const endpoint =
        entityType === "usuarios"
          ? `/admin/usuarios/${entityId}/status`
          : `/admin/clientes/${entityId}/status`;

      console.log(
        `🔄 Atualizando ${entityType} ID ${entityId} para status ${statusId}`
      );

      await api.put(
        endpoint,
        { status_id: statusId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      onUpdate(); // Atualiza a lista de usuários ou clientes
      onClose(); // Fecha o modal
    } catch (err) {
      console.error("❌ Erro ao atualizar status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          Editar Status {entityType === "usuarios" ? "Usuário" : "Cliente"}
        </h2>

        <select
          value={statusId}
          onChange={(e) => setStatusId(Number(e.target.value))}
          className="border px-4 py-2 w-full rounded-md mb-4"
        >
          {statusOptions.map((status) => (
            <option key={status.id} value={status.id}>
              {status.nome}
            </option>
          ))}
        </select>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

EditStatus.propTypes = {
  entityId: PropTypes.number.isRequired,
  currentStatusId: PropTypes.number.isRequired,
  entityType: PropTypes.string.isRequired, // "usuarios" ou "clientes"
  statusOptions: PropTypes.array.isRequired, // [{ id: 1, nome: "Ativo" }, ...]
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default EditStatus;
