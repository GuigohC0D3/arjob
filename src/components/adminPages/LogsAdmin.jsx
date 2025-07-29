import { useEffect, useState } from "react";
import api from "../../apiConfig";

const LogsAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/admin/logs");
        setLogs(response.data);
      } catch (err) {
        setError("Erro ao carregar logs. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <p>Carregando logs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Logs de Atividades</h2>
      <p>Veja todas as atividades recentes do sistema.</p>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default LogsAdmin;