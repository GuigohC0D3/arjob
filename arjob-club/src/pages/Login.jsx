import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Adicione estilos personalizados, se necessário.

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Exemplo de validação simples (troque por uma chamada à API se necessário)
    if (cpf === "12345678900" && senha === "admin") {
      navigate("/home"); // Redireciona para a página principal
    } else {
      setError("CPF ou senha inválidos.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite seu CPF"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            required
          />
        </div>
        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
