import { useState } from "react";
import PropTypes from "prop-types";
import api from "../../../apiConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ViewProfile = ({ user, onClose, onUpdate, isCliente }) => {
  const [status, setStatus] = useState(user.status_id || user.status); // funciona para ambos
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const statusOptions = [
    { id: 1, label: "Ativo" },
    { id: 2, label: "Inativo" },
    { id: 4, label: "Bloqueado" },
  ];

  const handleSave = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");

      if (!token) {
        alert("Erro de autenticação! Faça login novamente.");
        return;
      }

      const updateData = { status_id: status };

      const rota = isCliente
        ? `/admin/clientes/${user.id}/status`
        : `/admin/usuarios/${user.id}/status`;

      await api.put(rota, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error);
      alert("Erro ao atualizar status. Verifique suas permissões.");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl">
        <h2 className="text-lg font-bold mb-4">
          Perfil do {isCliente ? "Cliente" : "Usuário"}
        </h2>
        <p>
          <strong>Nome:</strong> {user.nome}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>CPF:</strong> {user.cpf}
        </p>

        <label className="block mt-4">Status:</label>
        <select
          value={status ?? ""}
          onChange={(e) => setStatus(Number(e.target.value))}
          className="border px-4 py-2 rounded-md w-full"
        >
          <option value="" disabled hidden>
            Selecionar Status
          </option>
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Oculta senha para clientes */}
        {!isCliente && (
          <>
            <button
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="mt-4 bg-green-400 text-white px-4 py-2 rounded-md w-full"
            >
              {showPasswordFields
                ? "Cancelar Alteração de Senha"
                : "Alterar Senha"}
            </button>

            {showPasswordFields && (
              <div className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block">Senha Atual:</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="border px-4 py-2 rounded-md w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                      >
                        {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block">Nova Senha:</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border px-4 py-2 rounded-md w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block">Confirmar Nova Senha:</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        className="border px-4 py-2 rounded-md w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
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
          >
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
  isCliente: PropTypes.bool, // 👈 nova prop opcional
};

export default ViewProfile;
