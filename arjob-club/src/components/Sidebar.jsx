import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cargo, setCargo] = useState(null);
  const [error, setError] = useState("");
  const [permissoes, setPermissoes] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Novo estado para login

  // Verificar se o usuário está logado
  useEffect(() => {
    const checkLogin = () => {
      const token = sessionStorage.getItem("authToken");
      setIsLoggedIn(!!token); // Atualiza o estado de login com base no token
    };

    checkLogin();
  }, []);

  // Buscar permissões do usuário
useEffect(() => {
  if (isLoggedIn) {
    const fetchPermissoes = async () => {
      try {
        const token = sessionStorage.getItem("authToken"); // Obter o token armazenado
        const response = await axios.get("http://localhost:5000/permissoes", {
          withCredentials: true, // Inclui cookies ou credenciais
          headers: {
            Authorization: `Bearer ${token}`, // Enviar o token no cabeçalho
            "Content-Type": "application/json",
          },
        });
        setPermissoes(response.data.permissoes || []);
      } catch (error) {
        console.error(
          "Erro ao buscar permissões:",
          error.response?.data || error.message
        );
        setPermissoes([]); // Garante que o estado fique vazio em caso de erro
      }
    };

    fetchPermissoes();
  }
}, [isLoggedIn]);

// Buscar cargo do usuário
useEffect(() => {
  const fetchCargo = async () => {
    try {
      const response = await axios({
        url: "http://localhost:5000/auth/cargo",
        method: "GET",
        withCredentials: true, // Garante o envio de cookies ou tokens
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`, // Inclui o token, se necessário
        },
      });

      setCargo(response.data.cargo); // Atualiza o estado com o cargo do usuário
    } catch (error) {
      console.error(
        "Erro ao buscar cargo:",
        error.response?.data || error.message
      );
      setError("Erro ao buscar cargo do usuário.");
    }
  };

  // Chama a função fetchCargo dentro do useEffect
  fetchCargo();
}, [isLoggedIn]); // Dependência: só executa se o estado de login mudar


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
      {/* Exibição do cargo */}
      {cargo ? <p>Cargo: {cargo}</p> : <p>{error || "Carregando cargo..."}</p>}

      {/* Botão de menu */}
      <button
        className={`hamburger-btn ${isOpen ? "open" : ""}`}
        onClick={toggleSidebar}
      >
        <i className={`bi ${isOpen ? "bi-x" : "bi-list"}`}></i>
      </button>

      {/* Sidebar */}
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
