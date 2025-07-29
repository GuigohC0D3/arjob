import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Preloading.css"; // Adicione estilos personalizados

const Preloading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Home"); // Redireciona para a página principal após o carregamento
    }, 20000); // 3 segundos de carregamento (ajuste conforme necessário)
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="preloading-container">
      <div className="spinner"></div>
      <p>Carregando, por favor aguarde...</p>
    </div>
  );
};

export default Preloading;
