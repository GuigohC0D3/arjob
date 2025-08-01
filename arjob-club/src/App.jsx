import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

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
import NovaComanda from "./components/NovaComanda";
import Configuracoes from "./pages/Configuracoes";
import ComandaAberta from "./pages/ComandaAberta";
import GerenciarProdutos from "./pages/GerenciarProdutos";
import ForgotPassword from "./pages/ForgotPassword";
import NovaSenha from "./pages/NovaSenha";
import Relatorio from "./components/adminPages/relatorio";
import Dashboard from "./components/dashboard/Dashboard";
import RelatorioDetalhado from "./components/adminPages/RelatorioDetalhado";
import VerificarAutenticacao from "./pages/VerificarAutenticacao";

import Modal from "react-modal";
Modal.setAppElement("#root");

const PrivateRoute = () => {
  const [authReady, setAuthReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    console.log("[PrivateRoute] Token:", token);
    setHasToken(!!token);
    setAuthReady(true);
  }, []);

  if (!authReady) return null;
  return hasToken ? <Outlet /> : <Navigate to="/" />;
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cargo, setCargo] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  const noSidebarRoutes = ["/", "/Register", "/Preloading", "/verify-2fa"];

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("authToken");
    const twoFAConfirmed = sessionStorage.getItem("twoFAConfirmed") === "true";

    console.log("[AppContent] sessionStorage ->", {
      userStr,
      token,
      twoFAConfirmed,
    });

    if (userStr) {
      const user = JSON.parse(userStr);
      setCargo(user?.cargo || null);
      setUserLoaded(true);

      if (
        user?.otp_verificacao &&
        !twoFAConfirmed &&
        location.pathname !== "/verify-2fa"
      ) {
        console.log("Redirecionando para verificação 2FA");
        navigate("/verify-2fa");
        return; // 🔧 Impede renderização ou navegação incorreta
      }
    } else {
      console.warn("Nenhum usuário encontrado no sessionStorage!");
      setUserLoaded(true);
    }

    if (!token) {
      console.warn("Token ausente, redirecionando para login.");
      navigate("/");
    }
  }, [location.pathname, navigate]);

  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  if (!userLoaded && location.pathname !== "/verify-2fa") {
    return null;
  }

  return (
    <>
      {shouldShowSidebar && <Sidebar />}
      <div className={`main-content ${!shouldShowSidebar ? "auth-page" : ""}`}>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/Preloading" element={<Preloading />} />
          <Route path="/Register" element={<RegisterUser />} />
          <Route path="/verify" element={<VerifyAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route
            path="/verify-2fa"
            element={
              <VerificarAutenticacao
                user={JSON.parse(sessionStorage.getItem("user"))}
              />
            }
          />

          {/* Privadas */}
          <Route element={<PrivateRoute />}>
            {["admin", "administrador"].includes(cargo) && (
              <>
                <Route path="/Home" element={<MainContent />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/iniciar-venda" element={<IniciarVenda />} />
                <Route path="/historico" element={<ListagemComandas />} />
                <Route path="/Cliente" element={<CadastroCliente />} />
                <Route path="/produtos" element={<GerenciarProdutos />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/Fluxo" element={<FluxoDeCaixa />} />
                <Route path="/relatorio" element={<Relatorio />} />
                <Route
                  path="/relatorio_detalhado"
                  element={<RelatorioDetalhado />}
                />
                <Route path="/Importar" element={<ImportarFinanceiros />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/nova-comanda/:mesaId" element={<NovaComanda />} />
                <Route
                  path="/comanda-aberta/:comandaId"
                  element={<ComandaAberta />}
                />
              </>
            )}

            {cargo === "atendente" && (
              <>
                <Route path="/Home" element={<MainContent />} />
                <Route path="/iniciar-venda" element={<IniciarVenda />} />
                <Route path="/historico" element={<ListagemComandas />} />
                <Route path="/Cliente" element={<CadastroCliente />} />
                <Route path="/nova-comanda/:mesaId" element={<NovaComanda />} />
                <Route
                  path="/comanda-aberta/:comandaId"
                  element={<ComandaAberta />}
                />
              </>
            )}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
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
