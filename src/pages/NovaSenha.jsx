import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../apiConfig";

const NovaSenha = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [token, setToken] = useState("");
  const [forcaSenha, setForcaSenha] = useState("");
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    if (tokenParam) setToken(tokenParam);
  }, [location.search]);

  const verificarForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;

    if (forca <= 1) return "Fraca";
    if (forca === 2) return "Média";
    if (forca === 3) return "Forte";
    return "Muito Forte";
  };

  const handleSenhaChange = (e) => {
    const senha = e.target.value;
    setNovaSenha(senha);
    setForcaSenha(verificarForcaSenha(senha));
  };

  const handleRedefinir = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (forcaSenha === "Fraca" || forcaSenha === "Média") {
      setErro("Por favor, escolha uma senha forte ou muito forte.");
      return;
    }

    try {
      const response = await api.post("/redefinir-senha", {
        token,
        novaSenha,
      });

      if (response.status === 200) {
        setMensagem("Senha redefinida com sucesso! Redirecionando...");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao redefinir senha.");
    }
  };

  const getBarraClasse = () => {
    switch (forcaSenha) {
      case "Fraca":
        return "bg-red-500 w-1/4";
      case "Média":
        return "bg-yellow-500 w-2/4";
      case "Forte":
        return "bg-blue-500 w-3/4";
      case "Muito Forte":
        return "bg-green-500 w-full";
      default:
        return "bg-gray-300 w-0";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          Nova Senha
        </h2>

        {mensagem && (
          <p className="bg-green-100 text-green-700 border border-green-400 px-4 py-2 rounded-md text-sm mb-4 text-center">
            {mensagem}
          </p>
        )}
        {erro && (
          <p className="bg-red-100 text-red-600 border border-red-400 px-4 py-2 rounded-md text-sm mb-4 text-center">
            {erro}
          </p>
        )}

        <form onSubmit={handleRedefinir} className="space-y-4">
          <div>
            <label
              htmlFor="novaSenha"
              className="block text-gray-600 font-medium"
            >
              Nova Senha*
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                id="novaSenha"
                value={novaSenha}
                onChange={handleSenhaChange}
                placeholder="Digite sua nova senha"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 8 caracteres, com símbolo, número e letra maiúscula.
            </p>

            {novaSenha && (
              <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded-md overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-300 ${getBarraClasse()}`}
                  />
                </div>
                <p
                  className={`text-sm font-medium mt-1 ${
                    forcaSenha === "Fraca"
                      ? "text-red-600"
                      : forcaSenha === "Média"
                      ? "text-yellow-600"
                      : forcaSenha === "Forte"
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                >
                  Força da senha: {forcaSenha}
                </p>
              </div>
            )}

            {(forcaSenha === "Fraca" || forcaSenha === "Média") &&
              novaSenha && (
                <p className="text-red-500 text-sm mt-2 font-semibold">
                  Por favor, escolha uma senha mais forte.
                </p>
              )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Redefinir Senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default NovaSenha;
