import { useState, useEffect } from "react";
import { Link, useFetcher } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cargo, setCargo] = useState(null);
  const [error, setError] = useState("");
  const [permissoes, setPermissoes] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Novo estado para login

  useEffect(() => {
    const checkLogin = () => {
      const token = sessionStorage.getItem("authToken");
      setIsLoggedIn(!!token); // Atualiza o estado de login com base no token
    };

    checkLogin();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchPermissoes = async () => {
        try {
          const response = await axios.get("http://localhost:5000/permissoes");
          setPermissoes(response.data.permissoes);
        } catch (error) {
          console.error("Erro ao buscar permissões:", error);
        }
      };

      fetchPermissoes();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCargo = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/cargo", {
          withCredentials: true,
        });
        setCargo(response.data.cargo);
      } catch (err) {
        setError(err.response?.data?.error || "Erro ao buscar cargo.");
      }
    };

    fetchCargo();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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

  const filteredItems = menuItems.filter((item) =>
    permissoes.includes(item.permissao)
  );

  return (
    <>
      {cargo ? <p>Cargo: {cargo}</p> : <p>{error || "Carregando cargo..."}</p>}
      <button
        className={`hamburger-btn ${isOpen ? "open" : ""}`}
        onClick={toggleSidebar}
      >
        <i className={`bi ${isOpen ? "bi-x" : "bi-list"}`}></i>
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <header className="sidebar-header">ARJOB</header>
        <nav className="menu">
          <ul>
            {isLoggedIn ? (
              filteredItems.map((item) => (
                <li key={item.name}>
                  <Link to={item.path}>
                    <i className={item.icon}></i> {item.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link to="/Login">
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
