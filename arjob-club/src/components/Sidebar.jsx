import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ícones do Bootstrap
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar abertura/fechamento da sidebar

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Alterna o estado entre aberto e fechado
  };

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
            <li>
              <Link to="/iniciar-venda">
                <i className="bi bi-cart-plus"></i> Iniciar Venda
              </Link>
            </li>
            <li>
              <Link to="/listagem">
                <i className="bi bi-list-ul"></i> Histórico
              </Link>
            </li>
            <li>
              <Link to="/importar">
                <i className="bi bi-upload"></i> Exportar
              </Link>
            </li>
            <li>
              <Link to="/Fluxo">
                <i className="bi bi-credit-card"></i> Receber Parcelas
              </Link>
            </li>
            <li>
              <Link to="/Cliente">
                <i className="bi bi-person"></i> Clientes
              </Link>
            </li>
            <li>
              <Link to="/produtos">
                <i className="bi bi-box"></i> Produtos
              </Link>
            </li>
            <li>
              <Link to="/troca">
                <i className="bi bi-arrow-repeat"></i> Suporte
              </Link>
            </li>
            <li>
              <Link to="/">
              <i className="bi bi-arrow-bar-left"></i> Sair
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
