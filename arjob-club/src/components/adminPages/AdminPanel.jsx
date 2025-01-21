import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissoes, setUserPermissoes] = useState([]);
  const [todasPermissoes, setTodasPermissoes] = useState([]); // Todas as permissões do banco

  useEffect(() => {
    if (activeTab === "usuarios") {
      fetchUsuarios();
    } else if (activeTab === "clientes") {
      fetchClientes();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPermissoes();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/usuarios");
      console.log("Usuários recebidos:", response.data);
      setUsuarios(response.data[0] || []);
    } catch (error) {
      console.error(
        "Erro ao buscar usuários:",
        error.response?.data || error.message
      );
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const fetchPermissoes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/permissoes");
      setTodasPermissoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
    }
  };

  const handlePermissionChange = (permissao) => {
    setUserPermissoes((prev) =>
      prev.includes(permissao)
        ? prev.filter((p) => p !== permissao)
        : [...prev, permissao]
    );
  };

  const updatePermissoes = async () => {
    try {
      await axios.put(
        `http://localhost:5000/admin/usuarios/${selectedUser.id}/permissoes`,
        { permissoes: userPermissoes }
      );
      alert("Permissões atualizadas com sucesso");
      setSelectedUser(null);
      fetchUsuarios(); // Atualiza a lista de usuários após salvar
    } catch (error) {
      console.error("Erro ao atualizar permissões:", error);
    }
  };

  return (
    <div className="admin-panel">
      <div className="tabs">
        <button
          className={activeTab === "usuarios" ? "active-tab" : ""}
          onClick={() => setActiveTab("usuarios")}
        >
          Usuários
        </button>
        <button
          className={activeTab === "clientes" ? "active-tab" : ""}
          onClick={() => setActiveTab("clientes")}
        >
          Clientes
        </button>
      </div>

      {activeTab === "usuarios" && (
        <div>
          <h2>Gerenciar Usuários</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <button
                      className="icon-button edit-button"
                      onClick={() => {
                        setSelectedUser(usuario);
                        setUserPermissoes(usuario.permissoes || []);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-button delete-button"
                      onClick={() =>
                        alert("Função de exclusão em desenvolvimento")
                      }
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "clientes" && (
        <div>
          <h2>Gerenciar Clientes</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="permissions-modal">
          <h3>Editar Permissões: {selectedUser.nome}</h3>
          <div>
            {todasPermissoes.map((perm) => (
              <label key={perm}>
                <input
                  type="checkbox"
                  checked={userPermissoes.includes(perm)}
                  onChange={() => handlePermissionChange(perm)}
                />
                {perm.replace("_", " ").toUpperCase()}
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <button
              className="modal-button cancel"
              onClick={() => setSelectedUser(null)}
            >
              Cancelar
            </button>
            <button className="modal-button save" onClick={updatePermissoes}>
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
