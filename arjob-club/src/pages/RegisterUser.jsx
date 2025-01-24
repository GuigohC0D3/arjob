import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Toast } from "primereact/toast";
import "primeicons/primeicons.css";
import "./RegisterUser.css";
import { useRef } from "react";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cargo: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

  // Configuração da API Base
  const API_BASE_URL = "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nome") {
      const filteredValue = value.replace(/[^a-zA-Zá-úÁ-Ú\s]/g, "");
      setFormData({ ...formData, nome: filteredValue });
    } else if (name === "cpf") {
      const cleanedValue = value.replace(/\D/g, "");
      const formattedCPF = cleanedValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulário enviado");
    const { nome, cpf, email, senha, confirmarSenha, cargo } = formData;
    const newErrors = {};

    if (!nome) newErrors.nome = "Por favor, preencha seu nome.";
    if (!cpf) newErrors.cpf = "CPF inválido. Certifique-se de que está no formato correto.";
    if (!email || !email.includes("@")) newErrors.email = "E-mail inválido.";

    // Validação de força da senha
    if (passwordStrength === "fraca" || passwordStrength === "média") {
      toast.current.show({
        severity: "warn",
        summary: "Aviso",
        detail: "Senha fraca ou média, por favor digite uma senha mais forte.",
        life: 3000,
      });
      return;
    }

    if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("Erros encontrados:", newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificação de duplicidade no banco de dados
      console.log("Verificando duplicidade no banco de dados...");
      const checkResponse = await axios.post(`${API_BASE_URL}/users/check`, { cpf, email });
      console.log("Resposta do backend para verificação:", checkResponse.data);

      if (checkResponse.data.exists) {
        toast.current.show({
          severity: "warn",
          summary: "Aviso",
          detail: checkResponse.data.message,
          life: 3000,
        });
        setIsSubmitting(false);
        return;
      }

      // Criação do usuário
      console.log("Criando usuário...");
      const response = await axios.post(`${API_BASE_URL}/users`, {
        nome,
        cpf,
        email,
        senha,
        cargoId: cargo,
      });

      if (response.data) {
        console.log("Usuário registrado com sucesso:", response.data);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Usuário registrado com sucesso!",
          life: 3000,
        });
        await axios.post(`${API_BASE_URL}/send-confirmation-email`, { email });
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao registrar usuário:", error.response?.data || error.message);

      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: error.response?.data?.error || "Erro desconhecido. Tente novamente mais tarde.",
        life: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <Toast ref={toast} />
      <form onSubmit={handleSubmit}>
        <h2>Registro de Usuário</h2>

        <div className="form-group">
          <label htmlFor="nome">Nome*</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite seu nome"
            required
          />
          {errors.nome && <p className="error-text">{errors.nome}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF*</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="Digite seu CPF"
            required
          />
          {errors.cpf && <p className="error-text">{errors.cpf}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Digite seu e-mail"
            required
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group">
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
              ? "Senha Média"
              : passwordStrength === "forte"
              ? "Senha forte"
              : "Senha muito forte"}
          </p>
          {errors.senha && <p className="error-text">{errors.senha}</p>}
        </div>

        <div className="form-group">
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
              className={`pi ${showConfirmPassword ? "pi-eye-slash" : "pi-eye"}`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
            ></i>
          </div>
          {errors.confirmarSenha && <p className="error-text">{errors.confirmarSenha}</p>}
        </div>

        <button
          type="submit"
          className="login-button"
        >
          {isSubmitting ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
