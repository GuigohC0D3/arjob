import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Certifique-se de importar a Sidebar corretamente
import MainContent from './components/MainContent';
import IniciarVenda from './pages/IniciarVenda';
import ListagemComandas from './pages/ListagemComandas';
import ImportarFinanceiros from './pages/ImportarFinanceiros';
import CadastroCliente from './pages/CadastroCliente';
import FluxoDeCaixa from './pages/FluxoDeCaixa';
import Login from './pages/Login';
import Preloading from './pages/Preloading';

// Renomeamos o componente interno para evitar conflitos
const AppContent = () => {
  const location = useLocation(); // Hook para obter a rota atual
  const isLoginPage = location.pathname === '/'; // Verifica se a página atual é a de login

  return (
    <>
      {/* Renderiza a sidebar apenas se não for a página de login */}
      {!isLoginPage && <Sidebar />}

      <div className={`main-content ${isLoginPage ? 'login-page' : ''}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/Preloading' element={<Preloading/>} />
          <Route path="/Home" element={<MainContent />} />
          <Route path="/iniciar-venda" element={<IniciarVenda />} />
          <Route path="/Listagem" element={<ListagemComandas />} />
          <Route path="/Importar" element={<ImportarFinanceiros />} />
          <Route path="/Cliente" element={<CadastroCliente />} />
          <Route path="/Fluxo" element={<FluxoDeCaixa />} />
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
