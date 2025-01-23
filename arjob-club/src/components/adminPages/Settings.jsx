import { useState, useEffect } from "react";
import api from "../../apiConfig";

const Settings = () => {
  const [settings, setSettings] = useState({ theme: "Padrão", language: "Português" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/admin/settings");
        setSettings(response.data);
      } catch (err) {
        setError("Erro ao carregar configurações. Tente novamente.");
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (key, value) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSettings = { ...settings, [key]: value };
      await axios.put("http://localhost:5000/admin/settings", updatedSettings);
      setSettings(updatedSettings);
    } catch (err) {
      setError("Erro ao atualizar configurações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Configurações</h2>
      <p>Configure as preferências do sistema:</p>
      {error && <p>{error}</p>}
      <ul>
        <li>
          <label>
            Tema:
            <select
              value={settings.theme}
              onChange={(e) => updateSettings("theme", e.target.value)}
              disabled={loading}
            >
              <option>Padrão</option>
              <option>Claro</option>
              <option>Escuro</option>
            </select>
          </label>
        </li>
        <li>
          <label>
            Idioma:
            <select
              value={settings.language}
              onChange={(e) => updateSettings("language", e.target.value)}
              disabled={loading}
            >
              <option>Português</option>
              <option>Inglês</option>
              <option>Espanhol</option>
            </select>
          </label>
        </li>
      </ul>
    </div>
  );
};

export default Settings;
