import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../apiConfig";

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verificando sua conta...");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("Token inválido!");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        await api.get(
          `/auth/verify?token=${encodeURIComponent(token)}`,
          { timeout: 10000 }
        );

        setMessage("Conta ativada com sucesso! Redirecionando...");
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        console.error("Erro na verificação:", error);
        setMessage("Erro ao ativar a conta. O token pode estar expirado ou inválido.");
        setTimeout(() => navigate("/"), 3000);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return <h2>{message}</h2>;
};

export default VerifyAccount;
