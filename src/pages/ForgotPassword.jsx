import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../apiConfig";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleEnviarToken = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    try {
      const response = await api.post("/solicitar-redefinicao", { email });
      if (response.status === 200) {
        setMensagem("Um token de recuperação foi enviado para seu e-mail.");
      }
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao enviar token.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          Recuperar Senha
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

        <form onSubmit={handleEnviarToken} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-600 font-medium">
              E-mail*
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Enviar Email
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-all"
          >
            Voltar para Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
