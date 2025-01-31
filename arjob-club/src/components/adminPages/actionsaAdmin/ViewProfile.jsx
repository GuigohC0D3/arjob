import { useState } from "react";
import PropTypes from "prop-types";
import api from "../../apiConfig";

const ViewProfile = ({ user, onClose, onUpdate }) => {
  const [status, setStatus] = useState(user.status);

  const statusOptions = [
    { id: 1, label: "Ativo" },
    { id: 2, label: "Inativo" },
    { id: 3, label: "Bloqueado" },
  ];

  const handleSave = async () => {
    try {
      await api.put(`/admin/usuarios/${user.id}/status`, { status });
      onUpdate(); // Atualiza a lista de usuários no painel
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Perfil do Usuário</h2>
        <p><strong>Nome:</strong> {user.nome}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>CPF:</strong> {user.cpf}</p>

        <label className="block mt-4">Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(Number(e.target.value))}
          className="border px-4 py-2 rounded-md w-full"
        >
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">
            Fechar
          </button>
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

ViewProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default ViewProfile;
