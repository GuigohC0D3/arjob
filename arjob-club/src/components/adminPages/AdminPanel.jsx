// Importações essenciais
import { useState, useEffect } from "react";
import api from "../apiConfig";
import { ConfirmDialog } from "primereact/confirmdialog";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./AdminPanel.css";

// Importando componentes adicionais
import Dashboard from "./DashboardAdmin";
import Logs from "./Filters";
import Filters from "./LogsAdmin";
import Notifications from "./Notification";
import Settings from "./Settings";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissoes, setUserPermissoes] = useState([]);
  const [todasPermissoes, setTodasPermissoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, message: "", accept: null });

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
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/usuarios");
      setUsuarios(response.data[0] || []);
    } catch (err) {
      setError("Erro ao carregar usuários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/clientes");
      setClientes(response.data);
    } catch (err) {
      setError("Erro ao carregar clientes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/permissoes");
      setTodasPermissoes(response.data);
    } catch (err) {
      setError("Erro ao carregar permissões. Tente novamente.");
    } finally {
      setLoading(false);
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
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    try {
      await api.put(
        `/admin/usuarios/${selectedUser.id}/permissoes`,
        { permissoes: userPermissoes }
      );
      alert("Permissões atualizadas com sucesso");
      setSelectedUser(null);
      fetchUsuarios();
    } catch (err) {
      setError("Erro ao atualizar permissões. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (message, onAccept) => {
    setConfirmDialog({ visible: true, message, accept: onAccept });
  };

  return (
    <div className="admin-panel">
      <ConfirmDialog
        visible={confirmDialog.visible}
        message={confirmDialog.message}
        onHide={() => setConfirmDialog({ ...confirmDialog, visible: false })}
        accept={confirmDialog.accept}
        reject={() => setConfirmDialog({ ...confirmDialog, visible: false })}
      />

      <div className="tabs">
        <button
          className={activeTab === "usuarios" ? "active-tab" : ""}
          onClick={() => setActiveTab("usuarios")}
          disabled={loading}
        >
          Usuários
        </button>
        <button
          className={activeTab === "clientes" ? "active-tab" : ""}
          onClick={() => setActiveTab("clientes")}
          disabled={loading}
        >
          Clientes
        </button>
        <button
          className={activeTab === "dashboard" ? "active-tab" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={activeTab === "logs" ? "active-tab" : ""}
          onClick={() => setActiveTab("logs")}
        >
          Logs
        </button>
        <button
          className={activeTab === "filters" ? "active-tab" : ""}
          onClick={() => setActiveTab("filters")}
        >
          Filtros
        </button>
        <button
          className={activeTab === "notifications" ? "active-tab" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notificações
        </button>
        <button
          className={activeTab === "settings" ? "active-tab" : ""}
          onClick={() => setActiveTab("settings")}
        >
          Configurações
        </button>
      </div>

      {loading && <p className="loading">Carregando...</p>}
      {error && <p className="error">{error}</p>}

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
                        openConfirmDialog(
                          "Tem certeza que deseja excluir este usuário?",
                          () => alert("Função de exclusão em desenvolvimento")
                        )
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
            <button
              className="modal-button save"
              onClick={updatePermissoes}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "logs" && <Logs />}
      {activeTab === "filters" && <Filters />}
      {activeTab === "notifications" && <Notifications />}
      {activeTab === "settings" && <Settings />}
    </div>
  );
};

export default AdminPanel;
