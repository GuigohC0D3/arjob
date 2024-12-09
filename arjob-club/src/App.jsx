import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Certifique-se de importar a Sidebar corretamente
import MainContent from './components/MainContent';
import IniciarVenda from './pages/IniciarVenda';
import ListagemComandas from './pages/ListagemComandas'
import ImportarFinanceiros from './pages/ImportarFinanceiros';
import CadastroCliente from './pages/CadastroCliente';
import FluxoDeCaixa from './pages/FluxoDeCaixa';

const App = () => (
  <Router>  {/* Envolva sua aplicação com o Router */}
    <div className="app">
      <Sidebar />  {/* Sidebar que contém os links de navegação */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/iniciar-venda" element={<IniciarVenda />} />
          <Route path="/Listagem" element={<ListagemComandas />}/>
          <Route path="/Importar" element={<ImportarFinanceiros/>} />
          <Route path="/Cliente" element={<CadastroCliente/>} />
          <Route path="/Fluxo" element={<FluxoDeCaixa/>} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;
