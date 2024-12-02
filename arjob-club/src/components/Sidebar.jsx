import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">ARJOB</header>
      <nav className="menu">
        <ul>
          <li>
            <button>
              <i className="bi bi-cart-plus-fill"></i> Iniciar Venda (F2)
            </button>
          </li>
          <li>
            <button>
              <i className="bi bi-list-check"></i> Listagem (F11)
            </button>
          </li>
          <li>
            <button>
              <i className="bi bi-cloud-arrow-up-fill"></i> Importar (F5)
            </button>
          </li>
          <li>
            <button>
              <i className="bi bi-cash-coin"></i> Receber Parcelas (F6)
            </button>
          </li>
          <li>
            <button>
              <i className="bi bi-person-fill"></i> Clientes (F7)
            </button>
          </li>
          <li>
            <button>
              <i className="bi bi-box-seam"></i> Produtos (F8)
            </button>
          </li>
          <li>
            <button>
              <i className="bi bi-arrow-repeat"></i> Troca (Ctrl + T)
            </button>
          </li>
          <li>
            <button>
              <i className="bi bi-gear-fill"></i> Supervisor (F9)
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
