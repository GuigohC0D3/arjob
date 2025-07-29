import { useEffect, useState } from "react";
import api from "../../apiConfig";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/admin/notifications");
        setNotifications(response.data);
      } catch (err) {
        setError("Erro ao carregar notificações. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) return <p>Carregando notificações...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Notificações</h2>
      <p>Acompanhe aqui as notificações importantes do sistema:</p>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;