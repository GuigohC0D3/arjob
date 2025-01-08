import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar"; // Certifique-se de importar a Sidebar corretamente
import MainContent from "./components/MainContent";
import IniciarVenda from "./pages/IniciarVenda";
import ListagemComandas from "./pages/ListagemComandas";
import ImportarFinanceiros from "./pages/ImportarFinanceiros";
import CadastroCliente from "./pages/CadastroCliente";
import FluxoDeCaixa from "./pages/FluxoDeCaixa";
import Login from "./pages/Login";
import Preloading from "./pages/Preloading";
import RegisterUser from "./pages/RegisterUser";

// Renomeamos o componente interno para evitar conflitos
const AppContent = () => {
  const location = useLocation();

  // Páginas onde a sidebar **não deve** aparecer
  const noSidebarRoutes = ["/", "/Register", "/Preloading"];

  // Verifica se a rota atual está na lista acima
  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowSidebar && <Sidebar />}

      <div className={`main-content ${!shouldShowSidebar ? "auth-page" : ""}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Preloading" element={<Preloading />} />
          <Route path="/Home" element={<MainContent />} />
          <Route path="/iniciar-venda" element={<IniciarVenda />} />
          <Route path="/Listagem" element={<ListagemComandas />} />
          <Route path="/Importar" element={<ImportarFinanceiros />} />
          <Route path="/Cliente" element={<CadastroCliente />} />
          <Route path="/Fluxo" element={<FluxoDeCaixa />} />
          <Route path="/Register" element={<RegisterUser />} />
        </Routes>
      </div>
    </>
  );
};

// Envolvemos o AppContent com o Router
const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
