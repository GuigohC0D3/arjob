import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ícones do Bootstrap
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar abertura/fechamento da sidebar
  const [permissoes, setPermissoes] = useState([]); // Permissões do usuário logado

  // Carregar permissões do usuário logado
  useEffect(() => {
    const fetchPermissoes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/permissoes"); // Endpoint para buscar permissões
        setPermissoes(response.data.permissoes); // Define as permissões recebidas
      } catch (error) {
        console.error("Erro ao buscar permissões:", error);
      }
    };

    fetchPermissoes();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Alterna o estado entre aberto e fechado
  };

  // Itens do menu com suas permissões associadas
  const menuItems = [
    { name: "Iniciar Venda", path: "/iniciar-venda", permissao: "iniciar_venda", icon: "bi bi-cart-plus" },
    { name: "Histórico", path: "/listagem", permissao: "historico", icon: "bi bi-list-ul" },
    { name: "Clientes", path: "/Cliente", permissao: "gerenciar_clientes", icon: "bi bi-person" },
    { name: "Produtos", path: "/produtos", permissao: "produtos", icon: "bi bi-box" },
    { name: "Suporte", path: "/troca", permissao: "suporte", icon: "bi bi-headphones" },
    { name: "Painel Administrador", path: "/admin", permissao: "painel_admin", icon: "bi bi-person-vcard" },
    { name: "Sair", path: "/", permissao: "logout", icon: "bi bi-arrow-bar-left" },
  ];

  // Filtrar itens do menu com base nas permissões do usuário
  const filteredItems = menuItems.filter((item) => permissoes.includes(item.permissao));

  return (
    <>
      {/* Botão de Menu Hambúrguer */}
      <button className={`hamburger-btn ${isOpen ? "open" : ""}`} onClick={toggleSidebar}>
        <i className={`bi ${isOpen ? "bi-x" : "bi-list"}`}></i>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <header className="sidebar-header">ARJOB</header>
        <nav className="menu">
          <ul>
            {filteredItems.map((item) => (
              <li key={item.name}>
                <Link to={item.path}>
                  <i className={item.icon}></i> {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
