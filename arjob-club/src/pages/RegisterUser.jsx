import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cpf } from "cpf-cnpj-validator"; // Importa a biblioteca
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./RegisterUser.css";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para erros de validação
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cpf") {
      const cleanedValue = value.replace(/\D/g, "");
      const formattedCPF = cleanedValue
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2")
        .slice(0, 14);
      setFormData({ ...formData, cpf: formattedCPF });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "senha") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  };

  const evaluatePasswordStrength = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    const length = password.length;

    if (length >= 12 && hasUppercase && hasNumbers && hasSpecialChar) {
      return "muito-forte";
    }

    if (length >= 8 && hasUppercase && hasNumbers && hasSpecialChar) {
      return "forte";
    }

    if (length >= 6 && hasUppercase && hasNumbers) {
      return "média";
    }

    return "fraca";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nome, cpf: cpfValue, email, senha, confirmarSenha } = formData;
    const newErrors = {};

    if (!nome) {
      newErrors.nome = "Por favor, preencha seu nome.";
    }

    if (!cpfValue || !cpf.isValid(cpfValue.replace(/\D/g, ""))) {
      newErrors.cpf = "CPF inválido. Certifique-se de que está no formato correto.";
    }

    if (!email || !email.includes("@")) {
      newErrors.email = "E-mail inválido.";
    }

    if (!senha) {
      newErrors.senha = "A senha é obrigatória.";
    } else if (senha.length < 8) {
      newErrors.senha = "A senha deve ter pelo menos 8 caracteres.";
    }

    if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
          <label htmlFor="nome">Nome*</label>
          <div className="input-with-icon">
            <i className="pi pi-user"></i>
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
          {errors.nome && <p className="error-text">{errors.nome}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF*</label>
          <div className="input-with-icon">
            <i className="pi pi-id-card"></i>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="Digite seu CPF"
              required
            />
          </div>
          {errors.cpf && <p className="error-text">{errors.cpf}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail*</label>
          <div className="input-with-icon">
            <i className="pi pi-envelope"></i>
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
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group password-group">
          <label htmlFor="senha">Senha*</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
            />
            <i
              className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            ></i>
          </div>
          <div className="progress-bar-container">
            <div className={`progress-bar ${passwordStrength}`}></div>
          </div>
          <p className={`password-strength-text ${passwordStrength}`}>
            {passwordStrength === "fraca"
              ? "Senha fraca"
              : passwordStrength === "média"
              ? "Senha média"
              : passwordStrength === "forte"
              ? "Senha forte"
              : "Senha muito forte"}
          </p>
          {errors.senha && <p className="error-text">{errors.senha}</p>}
        </div>

        <div className="form-group password-group">
          <label htmlFor="confirmarSenha">Confirmar Senha*</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              required
            />
            <i
              className={`pi ${
                showConfirmPassword ? "pi-eye-slash" : "pi-eye"
              }`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
            ></i>
          </div>
          {errors.confirmarSenha && <p className="error-text">{errors.confirmarSenha}</p>}
        </div>

        <button type="submit" className="login-button">
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
