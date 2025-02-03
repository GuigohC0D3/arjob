// Importações essenciais
import { useState, useEffect, useRef } from "react";
import api from "../../apiConfig";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";

// Importando ícones FontAwesome
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

// Importando componentes adicionais
import EditCargo from "./actionsaAdmin/EditCargo";
import ViewProfile from "./actionsaAdmin/ViewProfile";
import Dashboard from "./DashboardAdmin";
import Logs from "./Filters";
import Filters from "./LogsAdmin";
import Notifications from "./Notification";
import Settings from "./Settings";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  // Páginação
  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Número de usuários por página

  const [editCargoModal, setEditCargoModal] = useState({
    open: false,
    userId: null,
    currentCargo: null,
  });

  const [viewProfileModal, setViewProfileModal] = useState({
    open: false,
    user: null,
  });

  useEffect(() => {
    if (activeTab === "usuarios") {
      fetchUsuarios();
    } else if (activeTab === "clientes") {
      fetchClientes();
    }
  }, [activeTab]);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/usuarios");
      const statusResponse = await api.get("/admin/usuarios/status");

      console.log("Usuários:", response.data);
      console.log("Status dos usuários:", statusResponse.data);

      // Criar um mapa com os status
      const statusMap = statusResponse.data.reduce((acc, user) => {
        acc[user.id] = user.status;
        return acc;
      }, {});

      // Atualizar os usuários com o status correspondente
      const usuariosAtualizados = response.data[0].map((usuario) => ({
        ...usuario,
        status: statusMap[usuario.id] || "Desconhecido",
      }));

      setUsuarios(usuariosAtualizados);
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
      setClientes(response.data || []);
    } catch (err) {
      setError("Erro ao carregar clientes.");
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar clientes.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    confirmDialog({
      message: "Você tem certeza que deseja excluir este usuário?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("authToken");

          if (!token) {
            toast.current.show({
              severity: "error",
              summary: "Erro de autenticação",
              detail: "Faça login novamente.",
              life: 3000,
            });
            return;
          }

          await api.delete(`/admin/usuarios/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Enviando o token corretamente
            },
          });

          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Usuário excluído com sucesso.",
            life: 3000,
          });

          fetchUsuarios(); // 🔄 Atualiza a lista de usuários após a exclusão
        } catch (error) {
          console.error("❌ Erro ao excluir usuário:", error);
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao excluir usuário. Verifique suas permissões.",
            life: 3000,
          });
        }
      },
    });
  };

  const statusLabels = {
    1: "Ativo",
    2: "Inativo",
    3: "Pendente",
    4: "Bloqueado",
  };

  const statusColors = {
    Ativo: "bg-green-500",
    Inativo: "bg-gray-500",
    Pendente: "bg-yellow-500",
    Bloqueado: "bg-red-500",
  };

  const handleEditCargo = (userId, currentCargo) => {
    setEditCargoModal({ open: true, userId, currentCargo });
  };

  const handleView = (user) => {
    setViewProfileModal({ open: true, user });
  };

  const dataToDisplay = activeTab === "usuarios" ? usuarios : clientes;
  const filteredData = dataToDisplay?.filter((item) =>
    item?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Paginação corrigida
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Cabeçalho de ações */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Pesquise um nome"
          className="border px-3 py-2 rounded-md shadow w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        {[
          "usuarios",
          "clientes",
          "dashboard",
          "logs",
          "filters",
          "notifications",
          "settings",
        ].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 px-4 font-bold text-sm rounded-md transition ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
            disabled={loading}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <table className="w-full border-collapse shadow-md">
        <thead>
          <tr className="bg-black text-white text-left">
            <th className="py-3 px-4">Nome</th>
            <th className="py-3 px-4">Criado em</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4">
                <p className="font-bold text-lg">{item.nome}</p>
                <p className="text-gray-600 text-sm">{item.email}</p>
                <p className="text-gray-500 text-xs">CPF: {item.cpf}</p>
              </td>
              <td className="py-3 px-4 text-gray-600">{item.criado_em} </td>
              <td className="py-3 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                    statusColors[statusLabels[item.status]] || "bg-gray-400"
                  }`}
                >
                  {statusLabels[item.status] || "Desconhecido"}
                </span>
              </td>
              <td className="py-3 px-4 flex space-x-2">
                <button
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  onClick={() => handleView(item)}
                >
                  <FaEye />
                </button>

                <button
                  className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"
                  onClick={() => handleEditCargo(item.id, item.cargo)}
                >
                  <FaEdit />
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  onClick={() => handleDelete(item.id, activeTab)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-4">
        <p>
          Results 1 to {filteredData.length} of {dataToDisplay.length}
        </p>
      </div>

      {/* Componentes extras */}
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "logs" && <Logs />}
      {activeTab === "filters" && <Filters />}
      {activeTab === "notifications" && <Notifications />}
      {activeTab === "settings" && <Settings />}
      {/* Paginação */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Próximo
        </button>
      </div>
      {editCargoModal.open && (
        <EditCargo
          userId={editCargoModal.userId}
          currentCargo={editCargoModal.currentCargo}
          onClose={() =>
            setEditCargoModal({ open: false, userId: null, currentCargo: null })
          }
          onUpdate={fetchUsuarios}
        />
      )}
      {/* Modal de Visualizar Perfil */}
      {viewProfileModal.open && (
        <ViewProfile
          user={viewProfileModal.user}
          onClose={() => setViewProfileModal({ open: false, user: null })}
          onUpdate={fetchUsuarios}
        />
      )}
    </div>
  );
};

export default AdminPanel;
