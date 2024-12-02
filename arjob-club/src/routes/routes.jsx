import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importação das telas
import MainContent from "../components/MainContent";  // Caminho ajustado para subir um nível
import IniciarVenda from "../pages/IniciarVenda";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/iniciar-venda" element={<IniciarVenda />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
