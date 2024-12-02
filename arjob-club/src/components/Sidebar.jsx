import { Link } from "react-router-dom"; // Importa o Link para navegação
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">ARJOB</header>
      <nav className="menu">
        <ul>
          <li>
            <Link to="/iniciar-venda">Iniciar Venda (F2)</Link>
          </li>
          <li>
            <Link to="/listagem">Listagem (F11)</Link>
          </li>
          <li>
            <Link to="/importar">Importar (F5)</Link>
          </li>
          <li>
            <Link to="/receber-parcelas">Receber Parcelas (F6)</Link>
          </li>
          <li>
            <Link to="/clientes">Clientes (F7)</Link>
          </li>
          <li>
            <Link to="/produtos">Produtos (F8)</Link>
          </li>
          <li>
            <Link to="/troca">Troca (Ctrl + T)</Link>
          </li>
          <li>
            <Link to="/supervisor">Supervisor (F9)</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
