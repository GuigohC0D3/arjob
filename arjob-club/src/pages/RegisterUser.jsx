import { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'primereact/resources/themes/lara-light-blue/theme.css';  // Tema opcional
import 'primereact/resources/primereact.min.css';               // Estilos do PrimeReact
import 'primeicons/primeicons.css';                             // Ícones
import "./RegisterUser.css";

const RegisterUser = () => {
    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        email: "",
        senha: "",
    });
    const [passwordStrength, setPasswordStrength] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Estado para alternar a exibição da senha
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Formatação do CPF
        if (name === "cpf") {
            // Remove caracteres que não são números
            const cleanedValue = value.replace(/\D/g, "");
            // Aplica a máscara do CPF (123.456.789-00)
            const formattedCPF = cleanedValue
                .replace(/^(\d{3})(\d)/, "$1.$2")
                .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                .replace(/\.(\d{3})(\d)/, ".$1-$2")
                .slice(0, 14); // Limita a 14 caracteres
            setFormData({ ...formData, cpf: formattedCPF });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Avaliação de força da senha
        if (name === "senha") {
            setPasswordStrength(evaluatePasswordStrength(value));
        }
    };

    const evaluatePasswordStrength = (password) => {
        if (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /\d/.test(password) &&
            /[^a-zA-Z0-9]/.test(password)
        ) {
            return "forte";
        }

        if (password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password)) {
            return "média";
        }

        return "fraca";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { nome, cpf, email, senha } = formData;

        if (!nome || !cpf || !email || !senha) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Validação do CPF
        if (cpf.length !== 14) {
            alert("CPF inválido. Certifique-se de usar o formato 123.456.789-00.");
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
                        placeholder="Digite seu CPF (123.456.789-00)"
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

                <div className="form-group password-group">
                    <label htmlFor="senha">Senha:</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"} // Alterna entre "text" e "password"
                            id="senha"
                            name="senha"
                            value={formData.senha}
                            onChange={handleChange}
                            placeholder="Digite sua senha"
                            required
                        />
                        <i
                            className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`}
                            onClick={() => setShowPassword(!showPassword)} // Alterna o estado
                            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        ></i>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{
                                width:
                                    passwordStrength === "fraca"
                                        ? "5%"
                                        : passwordStrength === "média"
                                            ? "50%"
                                            : "100%",
                                backgroundColor:
                                    passwordStrength === "fraca"
                                        ? "red"
                                        : passwordStrength === "média"
                                            ? "yellow"
                                            : "green",
                            }}
                        ></div>
                    </div>
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
