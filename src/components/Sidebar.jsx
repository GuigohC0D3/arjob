import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../apiConfig";
import "bootstrap-icons/font/bootstrap-icons.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [permissoes, setPermissoes] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const user = JSON.parse(sessionStorage.getItem("user"));

    setIsLoggedIn(!!token && !!user);

    if (user && token) {
      fetchPermissoes(user.id); // Busca permissões com o ID do usuário logado
    }
  }, []);

  const fetchPermissoes = async (usuarioId) => {
    try {
      const response = await api.get(`/permissoes?usuario_id=${usuarioId}`);
      setPermissoes(response.data.permissoes || []);
    } catch (error) {
      console.error(
        "Erro ao buscar permissões:",
        error.response?.data || error.message
      );
      setPermissoes([]);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      name: "Iniciar Venda",
      path: "/iniciar-venda",
      permissao: "iniciar_venda",
      icon: "bi bi-cart-plus",
    },
    {
      name: "Histórico",
      path: "/historico",
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
      icon: "bi bi-basket2",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      permissao: "suporte",
      icon: "bi bi-bar-chart",
    },
    {
      name: "Painel Administrador",
      path: "/admin",
      permissao: "painel_admin",
      icon: "bi bi-person-vcard",
    },
    { name: "Configurações", path: "/configuracoes", icon: "bi bi-gear" },
    { name: "Sair", path: "/", icon: "bi bi-arrow-bar-left" },
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.permissao || permissoes.includes(item.permissao)
  );

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-2 rounded transition ${
          isOpen ? "hidden" : ""
        }`}
      >
        <i className="bi bi-list text-2xl"></i>
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-100 dark:bg-gray-800 shadow-lg p-4 transition-transform z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button onClick={toggleSidebar} className="mb-4 p-2 rounded transition">
          <i className="bi bi-x text-2xl"></i>
        </button>

        <header className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          <a href="/Home">ARJOB</a>
        </header>

        <nav>
          <ul className="space-y-4">
            {isLoggedIn ? (
              filteredItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-2 transition"
                  >
                    <i className={`${item.icon} text-lg`}></i>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link to="/" className="flex items-center space-x-2">
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Login</span>
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
