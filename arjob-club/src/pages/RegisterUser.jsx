import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const hasUppercase = /[A-Z]/.test(password); // Contém letra maiúscula
    const hasNumbers = /\d/.test(password); // Contém número
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password); // Contém caractere especial
    const length = password.length; // Comprimento da senha

    // Muito Forte: Pelo menos 12 caracteres + todos os requisitos
    if (length >= 12 && hasUppercase && hasNumbers && hasSpecialChar) {
      return "muito-forte";
    }

    // Forte: Pelo menos 8 caracteres + todos os requisitos
    if (length >= 8 && hasUppercase && hasNumbers && hasSpecialChar) {
      return "forte";
    }

    // Média: Pelo menos 6 caracteres + números e letras maiúsculas
    if (length >= 6 && hasUppercase && hasNumbers) {
      return "média";
    }

    // Fraca: Não atende aos critérios acima
    return "fraca";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nome, cpf, email, senha, confirmarSenha } = formData;

    if (!nome || !cpf || !email || !senha || !confirmarSenha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (cpf.length !== 14) {
      alert("CPF inválido. Certifique-se de usar o formato 123.456.789-00.");
      return;
    }

    if (!email.includes("@")) {
      alert("E-mail inválido.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    if (senha.length < 8) {
      alert("A senha deve ter pelo menos 8 caracteres.");
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
        </div>

        <button type="submit" className="login-button">
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
