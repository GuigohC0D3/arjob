import { Link } from 'react-router-dom';  // Importe o Link do react-router-dom
import 'bootstrap-icons/font/bootstrap-icons.css';  // Importe os ícones do Bootstrap
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">ARJOB</header>
      <nav className="menu">
        <ul>
          <li>
            <Link to="/iniciar-venda">
              <i className="bi bi-cart-plus"></i> Iniciar Venda (F2)
            </Link>
          </li>
          <li>
            <Link to="/listagem">
              <i className="bi bi-list-ul"></i> Histórico (F11)
            </Link>
          </li>
          <li>
            <Link to="/importar">
              <i className="bi bi-upload"></i> Exportar (F5)
            </Link>
          </li>
          <li>
            <Link to="/receber-parcelas">
              <i className="bi bi-credit-card"></i> Receber Parcelas (F6)
            </Link>
          </li>
          <li>
            <Link to="/clientes">
              <i className="bi bi-person"></i> Clientes (F7)
            </Link>
          </li>
          <li>
            <Link to="/produtos">
              <i className="bi bi-box"></i> Produtos (F8)
            </Link>
          </li>
          <li>
            <Link to="/troca">
              <i className="bi bi-arrow-repeat"></i> Troca (Ctrl + T)
            </Link>
          </li>
          <li>
            <Link to="/supervisor">
              <i className="bi bi-briefcase"></i> Supervisor (F9)
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
