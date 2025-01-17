import { useState, useEffect } from "react";
import "./MainContent.css";

const MainContent = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Recupera o usuário armazenado no sessionStorage
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <>
      {/* Conteúdo principal */}
      <main className="main">
        <div className="logo">ARJOB</div>
      </main>

      {/* Rodapé */}
      <footer className="footer">
        <p>Operador: {user ? user.nome : "Desconhecido"}</p>
        <br />
        <p>Computador: GUILHERME</p>
        <br />
        <p>
          Servidor: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </footer>
    </>
  );
};

export default MainContent;
