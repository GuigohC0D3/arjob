import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apiConfig";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { FaEye, FaEdit, FaUserTimes } from "react-icons/fa";
import EditCargo from "./actionsaAdmin/EditCargo";
import ViewProfile from "./actionsaAdmin/ViewProfile";
import RegisterUserModal from "../../pages/RegisterUserModal";

const ordenarPorNomeCompleto = (a, b) => {
  const [primeiroNomeA, ...restoA] = a.nome.split(" ");
  const [primeiroNomeB, ...restoB] = b.nome.split(" ");
  const nomeComp = primeiroNomeA.localeCompare(primeiroNomeB);
  if (nomeComp !== 0) return nomeComp;
  return restoA.join(" ").localeCompare(restoB.join(" "));
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editCargoModal, setEditCargoModal] = useState({
    open: false,
    userId: null,
    currentCargo: null,
  });
  const [viewProfileModal, setViewProfileModal] = useState({
    open: false,
    user: null,
  });

  const statusLabels = useMemo(
    () => ({
      1: "Ativo",
      2: "Inativo",
      3: "Pendente",
      4: "Bloqueado",
    }),
    []
  );

  const navigate = useNavigate();

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await api.get("/admin/usuarios");
      const statusResponse = await api.get("/admin/usuarios/status");
      const statusMap = statusResponse.data.reduce((acc, user) => {
        acc[user.id] = user.status;
        return acc;
      }, {});
      const usuariosAtualizados = response.data[0]
        .map((usuario) => ({
          ...usuario,
          status_id: statusMap[usuario.id],
          status: statusLabels[statusMap[usuario.id]] || "Desconhecido",
        }))
        .sort(ordenarPorNomeCompleto);
      setUsuarios(usuariosAtualizados);
    } catch (err) {
      console.error(err);
    }
  }, [statusLabels]);

  const fetchClientes = async () => {
    try {
      const response = await api.get("/admin/clientes");
      const statusResponse = await api.get("/admin/clientes/status");
      const statusMap = statusResponse.data.reduce((acc, s) => {
        acc[s.id] = s.nome;
        return acc;
      }, {});
      const clientesAtualizados = response.data
        .map((cliente) => ({
          ...cliente,
          status_id: cliente.status_id,
          status: statusMap[cliente.status_id] || "Desconhecido",
        }))
        .sort(ordenarPorNomeCompleto);
      setClientes(clientesAtualizados);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "usuarios") fetchUsuarios();
    else if (activeTab === "clientes") fetchClientes();
  }, [activeTab, fetchUsuarios]);

  const handleDelete = async (userId) => {
    confirmDialog({
      message: "Deseja mesmo desativar este usuário?",
      header: "Confirmação",
      icon: "pi pi-exclamation-triangle",
      draggable: false,
      accept: async () => {
        try {
          await api.delete(`/admin/usuarios/${userId}`);
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Usuário desativado.",
          });
          fetchUsuarios();
        } catch {
          toast.current.show({
            severity: "error",
            summary: "Erro",
            detail: "Falha ao desativar.",
          });
        }
      },
    });
  };

  const filteredData = (activeTab === "usuarios" ? usuarios : clientes).filter(
    (item) => item?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-800">
          Painel Administrativo
        </h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700 transition"
          >
            Registrar
          </button>
          <button
            onClick={() => navigate("/relatorio")}
            className="bg-green-600 text-white px-5 py-2 rounded-md shadow hover:bg-green-700 transition"
          >
            Relatório de Fechamento
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-8 space-x-4">
        {["usuarios", "clientes"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 rounded-full font-semibold transition 
            ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="relative w-64 h-64 bg-white p-5 rounded-xl shadow hover:shadow-lg 
  transition transform hover:scale-105 flex flex-col justify-between"
          >
            <div
              className={`absolute top-3 right-3 w-[10px] aspect-square rounded-full flex-shrink-0
      ${
        item.status === "Ativo"
          ? "bg-green-500 animate-pulse"
          : item.status === "Pendente"
          ? "bg-yellow-400 animate-pulse"
          : item.status === "Bloqueado"
          ? "bg-red-500 animate-pulse"
          : "bg-gray-400"
      }`}
              title={item.status}
            ></div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 break-words w-52">
                {item.nome}
              </h2>
              <p className="text-sm text-gray-600 break-words w-52 mt-2">
                Email: {item.email}
              </p>
              <p className="text-sm text-gray-500 break-words w-52">
                CPF: {item.cpf}
              </p>
            </div>

            <div className="flex justify-center space-x-5 mt-4">
              <button
                className="text-blue-600 hover:text-blue-800 transition text-2xl"
                onClick={() => setViewProfileModal({ open: true, user: item })}
              >
                <FaEye />
              </button>
              <button
                className="text-yellow-500 hover:text-yellow-600 transition text-2xl"
                onClick={() =>
                  setEditCargoModal({
                    open: true,
                    userId: item.id,
                    currentCargo: item.cargo,
                  })
                }
              >
                <FaEdit />
              </button>
              <button
                className="text-red-500 hover:text-red-700 transition text-2xl"
                onClick={() => handleDelete(item.id)}
              >
                <FaUserTimes />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-6 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 transition"
          }`}
        >
          Anterior
        </button>
        <span className="font-semibold text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 transition"
          }`}
        >
          Próximo
        </button>
      </div>

      {/* Modals */}
      <RegisterUserModal
        visible={registerModalOpen}
        onHide={() => setRegisterModalOpen(false)}
      />
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
      {viewProfileModal.open && (
        <ViewProfile
          user={viewProfileModal.user}
          isCliente={activeTab === "clientes"}
          onClose={() => setViewProfileModal({ open: false, user: null })}
          onUpdate={activeTab === "clientes" ? fetchClientes : fetchUsuarios}
        />
      )}
    </div>
  );
};

export default AdminPanel;
