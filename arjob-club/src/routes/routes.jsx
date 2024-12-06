import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importação das telas
import MainContent from "./components/MainContent";  // Caminho ajustado para subir um nível
import IniciarVenda from "../pages/IniciarVenda";
import ComandasListagem from "../pages/ComandasListagem";
import ImportarFinanceiros from "../pages/ImportarFinanceiros";
import CadastroCliente from "../pages/CadastroCliente";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/iniciar-venda" element={<IniciarVenda />} />
        <Route path="/Listagem" element={<ComandasListagem />} />
        <Route path="/Importar" element={<ImportarFinanceiros/>} />
        <Route path="/Cliente" element={<CadastroCliente/>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
