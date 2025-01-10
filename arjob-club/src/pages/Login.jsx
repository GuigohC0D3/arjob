import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Importa o axios
import "./Login.css"; // Adicione estilos personalizados, se necessário.

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCpfChange = (e) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const formattedCPF = cleanedValue
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14); // Limita o comprimento ao padrão de CPF
    setCpf(formattedCPF); // Atualiza o estado com o CPF formatado
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        cpf,
        senha,
      });
  
      if (response.data) {
        console.log("Login bem-sucedido:", response.data);
  
        // Salva o token de autenticação
        sessionStorage.setItem("authToken", response.data.token || "loggedIn");
  
        // Redireciona para a Home
        navigate("/Home");
      }
    } catch (err) {
      console.error(
        "Erro ao autenticar usuário:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Erro ao autenticar.");
    }
  };
  

  const handleRegister = () => {
    navigate("/Register");
  };

  return (
    <div className="login-container">
      <h2>Entrada no Sistema</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="cpf">CPF*</label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={handleCpfChange} // Adiciona a formatação no evento onChange
            placeholder="Digite seu CPF"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="senha">Senha*</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            required
          />
        </div>
        <button type="submit" className="login-button">
          Entrar
        </button>
        <button type="button" className="login-button" onClick={handleRegister}>
          Registrar
        </button>
      </form>
    </div>
  );
};

export default Login;
