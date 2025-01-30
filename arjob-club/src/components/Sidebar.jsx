import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../apiConfig";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/fechar a sidebar
  const [cargo, setCargo] = useState(null);
  const [error, setError] = useState("");
  const [permissoes, setPermissoes] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar se o usuário está logado
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  // Buscar permissões do usuário
  useEffect(() => {
    const fetchPermissoes = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");

        const response = await api.get("/permissoes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPermissoes(response.data.permissoes || []);
      } catch (error) {
        console.error("Erro ao buscar permissões:", error.response?.data || error.message);
        setPermissoes([]);
      }
    };

    if (isLoggedIn) fetchPermissoes();
  }, [isLoggedIn]);

  // Buscar cargo do usuário
  useEffect(() => {
    const fetchCargo = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");

        const response = await api.get("/auth/cargo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCargo(response.data.cargo);
      } catch (error) {
        console.error("Erro ao buscar cargo:", error.response?.data || error.message);
        setError(error.response?.data?.error || "Erro ao buscar cargo.");
      }
    };

    if (isLoggedIn) fetchCargo();
  }, [isLoggedIn]);

  // Alternar visibilidade da sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Itens do menu com base nas permissões
  const menuItems = [
    {
      name: "Iniciar Venda",
      path: "/iniciar-venda",
      permissao: "iniciar_venda",
      icon: "bi bi-cart-plus",
    },
    {
      name: "Histórico",
      path: "/listagem",
      permissao: "historico",
      icon: "bi bi-list-ul",
    },
    {
      name: "Clientes",
      path: "/Cliente",
      permissao: "gerenciar_clientes",
      icon: "bi bi-person",
    },
    {
      name: "Produtos",
      path: "/produtos",
      permissao: "produtos",
      icon: "bi bi-box",
    },
    {
      name: "Suporte",
      path: "/troca",
      permissao: "suporte",
      icon: "bi bi-headphones",
    },
    {
      name: "Painel Administrador",
      path: "/admin",
      permissao: "painel_admin",
      icon: "bi bi-person-vcard",
    },
    {
      name: "Sair",
      path: "/",
      permissao: "logout",
      icon: "bi bi-arrow-bar-left",
    },
  ];

  // Filtrar itens do menu com base nas permissões
  const filteredItems = menuItems.filter((item) =>
    permissoes.includes(item.permissao)
  );

  return (
    <>
      {/* Botão de abrir o menu */}
      <button
        className={`hamburger-btn ${isOpen ? "hidden" : ""}`} // Esconde o botão quando a sidebar está aberta
        onClick={toggleSidebar}
      >
        <i className="bi bi-list text-2xl"></i>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Botão de fechar */}
        <button className="close-btn" onClick={toggleSidebar}>
          <i className="bi bi-x text-2xl"></i>
        </button>

        <header className="sidebar-header">ARJOB</header>

        <p className="sidebar-cargo">
          {cargo ? `Cargo: ${cargo}` : error || "Carregando cargo..."}
        </p>

        <nav className="menu">
          <ul className="space-y-4">
            {isLoggedIn ? (
              filteredItems.map((item, index) => (
                <li key={index} className="flex items-center p-3 space-x-4 hover:bg-gray-200 rounded-md">
                  <i className={`${item.icon} text-lg`}></i>
                  <Link to={item.path} className="text-gray-800 hover:text-gray-600">
                    {item.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link to="/">
                  <i className="bi bi-box-arrow-in-right"></i> Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
