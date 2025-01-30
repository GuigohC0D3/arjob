import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../apiConfig";

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verificando sua conta...");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      console.log("🔍 Token recebido:", token);

      if (!token) {
        setMessage("❌ Token inválido! Certifique-se de que copiou o link corretamente.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/auth/verify?token=${encodeURIComponent(token)}`,
          { timeout: 10000 }
        );

        console.log("✅ Verificação bem-sucedida:", response.data);
        setMessage("🎉 Conta ativada com sucesso!");
        setVerificationSuccess(true);
      } catch (error) {
        console.error("❌ Erro na verificação:", error);
        setMessage("⚠️ Erro ao ativar a conta. O token pode estar expirado ou inválido.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700">{message}</h2>
        
        {loading && <p className="text-gray-500 mt-2">Aguarde...</p>}

        {verificationSuccess && (
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Ir para Login
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
