import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Outlet, 
  Navigate,  
  useLocation 
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import IniciarVenda from "./pages/IniciarVenda";
import ListagemComandas from "./pages/ListagemComandas";
import ImportarFinanceiros from "./pages/ImportarFinanceiros";
import CadastroCliente from "./pages/CadastroCliente";
import FluxoDeCaixa from "./pages/FluxoDeCaixa";
import Login from "./pages/Login";
import Preloading from "./pages/Preloading";
import RegisterUser from "./pages/RegisterUser";
import AdminPanel from "./components/adminPages/AdminPanel";
import VerifyAccount from "./pages/VerifyAccount";

const PrivateRoute = () => {
  const authToken = sessionStorage.getItem("authToken");
  console.log("Auth token no PrivateRoute:", authToken); // Para debug
  return authToken ? <Outlet /> : <Navigate to="/" />;
};

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
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/Preloading" element={<Preloading />} />
          <Route path="/Register" element={<RegisterUser />} />
          <Route path="/verify" element={<VerifyAccount />} />

          {/* Rotas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/Home" element={<MainContent />} />
            <Route path="/iniciar-venda" element={<IniciarVenda />} />
            <Route path="/listagem" element={<ListagemComandas />} />
            <Route path="/Importar" element={<ImportarFinanceiros />} />
            <Route path="/Cliente" element={<CadastroCliente />} />
            <Route path="/Fluxo" element={<FluxoDeCaixa />} />
            <Route path="/admin" element={<AdminPanel/>} />
          </Route>
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
