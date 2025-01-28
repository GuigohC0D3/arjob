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
      console.log("Resposta da API para usuários:", response.data);
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
  
  const handleDelete = (id, type) => {
    confirmDialog({
      message: "Você tem certeza que deseja excluir?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await api.delete(`/admin/${type}/${id}`);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Item excluído com sucesso.",
            life: 3000,
          });
          type === "usuarios" ? fetchUsuarios() : fetchClientes();
        } catch {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao excluir item.",
            life: 3000,
          });
        }
      },
    });
  };

  const handleEdit = (id, type) => {
    toast.current.show({
      severity: "info",
      summary: "Editar",
      detail: `Editar ${
        type === "usuarios" ? "Usuário" : "Cliente"
      } com ID: ${id}`,
      life: 3000,
    });
    // Redirecione para a página de edição ou abra um modal para edição.
  };

  const handleView = (id, type) => {
    toast.current.show({
      severity: "info",
      summary: "Visualizar",
      detail: `Visualizar ${
        type === "usuarios" ? "Usuário" : "Cliente"
      } com ID: ${id}`,
      life: 3000,
    });
    // Redirecione para a página de detalhes.
  };

  const dataToDisplay = activeTab === "usuarios" ? usuarios : clientes;
  const filteredData = dataToDisplay?.filter((item) =>
    item?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Cabeçalho de ações */}
      <div className="flex justify-between items-center mb-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700">
          + ADD NEW
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded-md shadow hover:bg-gray-300">
          ⬇ EXPORT
        </button>
        <input
          type="text"
          placeholder="Search by Name"
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
          {filteredData.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4">
                <p className="font-bold text-lg">{item.nome}</p>
                <p className="text-gray-600 text-sm">{item.email}</p>
                <p className="text-gray-500 text-xs">CPF: {item.cpf}</p>
              </td>
              <td className="py-3 px-4 text-gray-600">{item.criado_em}              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                    item.status === "Ativo" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="py-3 px-4 flex space-x-2">
                <button
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                  onClick={() => handleView(item.id, activeTab)}
                >
                  <FaEye />
                </button>
                <button
                  className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"
                  onClick={() => handleEdit(item.id, activeTab)}
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
    </div>
  );
};

export default AdminPanel;
