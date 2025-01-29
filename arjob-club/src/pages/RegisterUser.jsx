import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apiConfig";
import { Toast } from "primereact/toast";
import { useRef } from "react";

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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

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
    const { nome, cpf, email, senha, confirmarSenha } = formData;
    const newErrors = {};

    if (!nome) newErrors.nome = "Por favor, preencha seu nome.";
    if (!cpf) newErrors.cpf = "CPF inválido. Certifique-se de que está no formato correto.";
    if (!email || !email.includes("@")) newErrors.email = "E-mail inválido.";

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
      console.log("Verificando duplicidade no banco de dados...");
      const checkResponse = await api.post(`/users/check`, { cpf, email });
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

      console.log("Criando usuário...");
      const response = await api.post(`/users`, {
        nome,
        cpf,
        email,
        senha
      });

      if (response.data) {
        console.log("Usuário registrado com sucesso:", response.data);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Usuário registrado com sucesso!",
          life: 3000,
        });
        await api.post(`/send-confirmation-email`, { email });
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
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-md">
      <Toast ref={toast} />
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Registro de Usuário</h2>

        <div className="mb-4">
          <label htmlFor="nome" className="block text-gray-700 font-medium mb-1">
            Nome*
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite seu nome"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="cpf" className="block text-gray-700 font-medium mb-1">
            CPF*
          </label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="Digite seu CPF"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.cpf && <p className="text-sm text-red-600 mt-1">{errors.cpf}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            E-mail*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Digite seu e-mail"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="senha" className="block text-gray-700 font-medium mb-1">
            Senha*
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <i
              className={`absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500 ${
                showPassword ? "pi pi-eye-slash" : "pi pi-eye"
              }`}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            ></i>
          </div>
          <div className="h-2 mt-2 rounded bg-gray-200">
            <div
              className={`h-full rounded ${
                passwordStrength === "muito-forte"
                  ? "bg-green-700 w-full"
                  : passwordStrength === "forte"
                  ? "bg-green-400 w-3/4"
                  : passwordStrength === "média"
                  ? "bg-yellow-500 w-1/2"
                  : "bg-red-500 w-1"
              }`}
            ></div>
          </div>
          <p
            className={`text-sm mt-1 font-medium ${
              passwordStrength === "muito-forte"
                ? "text-green-500"
                : passwordStrength === "forte"
                ? "text-green-400"
                : passwordStrength === "média"
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {passwordStrength === "fraca"
              ? "Senha fraca"
              : passwordStrength === "média"
              ? "Senha média"
              : passwordStrength === "forte"
              ? "Senha forte"
              : "Senha muito forte"}
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmarSenha" className="block text-gray-700 font-medium mb-1">
            Confirmar Senha*
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <i
              className={`absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500 ${
                showConfirmPassword ? "pi pi-eye-slash" : "pi pi-eye"
              }`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
            ></i>
          </div>
          {errors.confirmarSenha && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmarSenha}</p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full p-3 bg-blue-500 text-white font-bold rounded shadow hover:bg-blue-600 transition ${
            isSubmitting ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
