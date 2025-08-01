import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apiConfig";

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { cpf, senha });

      if (response.data && response.data.token) {
        const { token, user, permissions } = response.data;

        console.log("🔐 Dados recebidos no login:", {
          token,
          user,
          permissions,
        });

        // ✅ Limpa session anterior
        sessionStorage.clear();

        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("permissions", JSON.stringify(permissions));
        localStorage.setItem("token", token); // opcional

        console.log("⚡ Usuario salvo:", user);
        console.log("🧭 SessionStorage logo após login:", {
          authToken: sessionStorage.getItem("authToken"),
          user: sessionStorage.getItem("user"),
          twoFAConfirmed: sessionStorage.getItem("twoFAConfirmed"),
        });

        if (user.otp_verificacao) {
          console.log(
            "🔒 Usuário possui 2FA ativo. Redirecionando para /verify-2fa."
          );
          sessionStorage.setItem("twoFAConfirmed", "false");
          navigate("/verify-2fa");
        } else {
          console.log("✅ Login normal, indo direto para Home.");
          sessionStorage.setItem("twoFAConfirmed", "true");
          navigate("/Home");
        }
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

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          Entrada no Sistema
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 border border-red-400 px-4 py-2 rounded-md text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="cpf" className="block text-gray-600 font-medium">
              CPF*
            </label>
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="Digite seu CPF"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-gray-600 font-medium">
              Senha*
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full bg-gray-200 text-blue-700 py-2 rounded-md text-sm font-medium mt-2 hover:bg-gray-300 transition-all"
          >
            Esqueci minha senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
