import { useState } from "react";
import PropTypes from "prop-types";
import { FaSun, FaMoon, FaShieldAlt, FaFont } from "react-icons/fa";

const Configuracoes = ({ user }) => {
  const [theme, setTheme] = useState("light");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [fontSize, setFontSize] = useState("medium");

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    document.documentElement.style.fontSize =
      e.target.value === "small"
        ? "14px"
        : e.target.value === "large"
        ? "20px"
        : "16px";
  };

  const handleAtivar2FA = async () => {
    console.log("➡️ Clicou botão Ativar 2FA");
    if (user?.id) {
      console.log("👤 ID do usuário:", user.id);
      try {
        const res = await fetch(
          `http://10.11.1.80:5000/usuarios/${user.id}/ativar-2fa`,
          { method: "POST" }
        );
        console.log("🔄 Resposta do backend:", res);

        if (!res.ok) {
          console.error("⚠️ Erro na requisição:", res.status);
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        console.log("✅ QR Code URL gerado:", url);
        setQrCodeUrl(url);
      } catch (err) {
        console.error("🚨 Erro ao ativar 2FA:", err);
      }
    } else {
      console.warn("⚠️ user.id não está definido");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Configurações
        </h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === "light" ? (
                <FaSun className="text-yellow-500" />
              ) : (
                <FaMoon className="text-blue-400" />
              )}
              <span className="text-gray-700 dark:text-gray-200">Tema</span>
            </div>
            <button
              onClick={handleThemeChange}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Trocar para {theme === "light" ? "Escuro" : "Claro"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="text-green-500" />
              <span className="text-gray-700 dark:text-gray-200">
                Autenticação 2FA
              </span>
            </div>
            <button
              onClick={handleAtivar2FA}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Ativar 2FA
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaFont className="text-purple-500" />
              <span className="text-gray-700 dark:text-gray-200">
                Tamanho da Fonte
              </span>
            </div>
            <select
              value={fontSize}
              onChange={handleFontSizeChange}
              className="border rounded px-3 py-1 dark:bg-gray-700 dark:text-white"
            >
              <option value="small">Pequena</option>
              <option value="medium">Média</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>

      {qrCodeUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-700 p-6 rounded shadow max-w-sm w-full text-center">
            <h2 className="text-xl mb-4 font-semibold">Escaneie o QR Code</h2>
            <img
              src={qrCodeUrl}
              alt="QR Code Google Authenticator"
              className="mx-auto mb-4"
            />
            <button
              onClick={() => setQrCodeUrl(null)}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Configuracoes.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }),
};

export default Configuracoes;
