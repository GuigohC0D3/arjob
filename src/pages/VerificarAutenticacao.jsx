import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VerificarAutenticacao = ({ user }) => {
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    if (value && index < 5) {
      document.getElementById(`codigo-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const finalCode = codigo.join("");
    console.log("Verificando código:", finalCode);

    try {
      const res = await axios.post(
        `http://10.11.1.80:5000/usuarios/${user.id}/verificar-2fa`,
        { codigo: finalCode }
      );
      console.log("2FA verificado com sucesso:", res.data);

      if (!res.data.token) {
        console.error("Token não retornado pelo backend!");
        alert("Erro interno: token não recebido.");
        return;
      }

      sessionStorage.setItem("authToken", res.data.token);
      sessionStorage.setItem("twoFAConfirmed", "true");

      const updatedUser = { ...user, otp_verificacao: false };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("Usuário atualizado no sessionStorage:", updatedUser);

      navigate("/Home"); // sem reload
    } catch (err) {
      console.error("Erro ao verificar 2FA:", err);
      alert("Código inválido ou expirado. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Digite o código 2FA
        </h2>
        <div className="flex justify-center space-x-2">
          {codigo.map((num, idx) => (
            <input
              key={idx}
              id={`codigo-${idx}`}
              type="text"
              maxLength="1"
              value={num}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg dark:bg-white dark:text-black"
            />
          ))}
        </div>
        <button
          onClick={handleVerify}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Confirmar e prosseguir
        </button>
      </div>
    </div>
  );
};

VerificarAutenticacao.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    otp_verificacao: PropTypes.bool,
  }),
};

export default VerificarAutenticacao;
