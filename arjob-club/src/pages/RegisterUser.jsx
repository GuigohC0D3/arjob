import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterUser.css";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "cpf" ? value.replace(/\D/g, "") : value, // Remove caracteres não numéricos no CPF
    });

    if (name === "senha") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  };

  const evaluatePasswordStrength = (password) => {
    // Primeiro verifica se a senha é "forte"
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^a-zA-Z0-9]/.test(password)
    ) {
      return "forte";
    }

    // Depois verifica se é "média"
    if (password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password)) {
      return "média";
    }

    // Por último, retorna "fraca"
    return "fraca";
  };

  const getProgressBarStyle = () => {
    switch (passwordStrength) {
      case "fraca":
        return { width: "5%", backgroundColor: "#e3342f" }; // Vermelho
      case "média":
        return { width: "66%", backgroundColor: "#f2d024" }; // Amarelo
      case "forte":
        return { width: "100%", backgroundColor: "#38c172" }; // Verde
      default:
        return { width: "0%" };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nome, cpf, email, senha } = formData;

    if (!nome || !cpf || !email || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (cpf.length !== 11) {
      alert("CPF inválido. Deve conter 11 dígitos.");
      return;
    }

    if (!email.includes("@")) {
      alert("E-mail inválido.");
      return;
    }

    if (senha.length < 12) {
      alert("A senha deve ter pelo menos 12 caracteres.");
      return;
    }

    console.log("Usuário registrado:", formData);
    navigate("/home");
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Registro de Usuário</h2>

        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite seu nome"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="Digite seu CPF (apenas números)"
            maxLength={11}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Digite seu e-mail"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Digite sua senha"
            required
          />
          <div className="progress-bar-container">
            <div className="progress-bar" style={getProgressBarStyle()}></div>
          </div>
          {/* Texto indicando a força da senha */}
          <p
            className={`password-strength-text ${
              passwordStrength === "fraca"
                ? "text-red-600"
                : passwordStrength === "média"
                ? "text-yellow-500"
                : "text-green-600"
            }`}
          >
            {passwordStrength === "fraca"
              ? "Senha fraca"
              : passwordStrength === "média"
              ? "Senha média"
              : "Senha forte"}
          </p>
        </div>

        <button type="submit" className="login-button">
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
