import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importação das telas
import MainContent from "./components/MainContent";  // Caminho ajustado para subir um nível
import IniciarVenda from "../pages/IniciarVenda";
import ComandasListagem from "../pages/ComandasListagem";
import ImportarFinanceiros from "../pages/ImportarFinanceiros";
import CadastroCliente from "../pages/CadastroCliente";
import FluxoDeCaixa from "../pages/FluxoDeCaixa";
import Login from "../pages/Login"
import Preloading from "../pages/Preloading";
import RegisterUser from "../pages/RegisterUser";
import ComandaAberta from "../pages/ComandaAberta";
import AdminPanel from "../components/adminPages/AdminPanel"
import VerifyAccount from "../pages/VerifyAccount"
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path='/Preloading' element={<Preloading/>} />
        <Route path="/Home" element={<MainContent />} />
        <Route path="/iniciar-venda" element={<IniciarVenda />} />
        <Route path="/listagem" element={<ComandasListagem />} />
        <Route path="/Importar" element={<ImportarFinanceiros/>} />
        <Route path="/Cliente" element={<CadastroCliente/>} />
        <Route path="/Fluxo" element={<FluxoDeCaixa/>} />
        <Route path="/Register" element={<RegisterUser/>} />
        <Route path="/comandas/:numero" element={<ComandaAberta />} />
        <Route path="/admin" element={<AdminPanel/>} />
        <Route path="/verify" element={<VerifyAccount />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
