import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importação das telas
import MainContent from "./components/MainContent";
import IniciarVenda from "./pages/IniciarVenda";
import Listagem from "./pages/Listagem";
import Importar from "./pages/Importar";
import ReceberParcelas from "./pages/ReceberParcelas";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Troca from "./pages/Troca";
import Supervisor from "./pages/Supervisor";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/iniciar-venda" element={<IniciarVenda />} />
        <Route path="/listagem" element={<Listagem />} />
        <Route path="/importar" element={<Importar />} />
        <Route path="/receber-parcelas" element={<ReceberParcelas />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/troca" element={<Troca />} />
        <Route path="/supervisor" element={<Supervisor />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
