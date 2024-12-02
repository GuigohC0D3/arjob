import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import "./App.css";
import AppRoutes from "./routes/routes"; // Importando o arquivo de rotas

const App = () => {
  return (
    <div className="container">
      <Sidebar />
      <MainContent />
      <AppRoutes />
    </div>
  );
};

export default App;
