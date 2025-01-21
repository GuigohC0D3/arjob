import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Função para formatar o CPF
  const handleCpfChange = (e) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, "");
    const formattedCPF = cleanedValue
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
    setCpf(formattedCPF);
  };

  // Função para autenticar o usuário
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        cpf,
        senha,
      });

      if (response.data && response.data.token) {
        // Armazena o token no sessionStorage
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        sessionStorage.setItem(
          "permissions",
          JSON.stringify(response.data.permissions)
        );

        console.log("Token armazenado:", response.data.token);
        navigate("/Home"); // Redireciona após login bem-sucedido
      } else {
        setError("Erro: Token não recebido do servidor.");
      }
    } catch (err) {
      console.error(
        "Erro ao autenticar usuário:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Erro ao autenticar.");
    }
  };

  // Redirecionar para a página de registro
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
            onChange={handleCpfChange}
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
