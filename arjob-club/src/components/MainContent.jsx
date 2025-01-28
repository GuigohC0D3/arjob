import { useState, useEffect } from "react";

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
      <main className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="flex items-center text-4xl font-bold text-gray-1000">ARJOB</h1>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="w-full bg-gray-800 text-gray-200 text-center py-4">
        <p className="text-sm">Operador: {user ? user.nome : "Desconhecido"}</p>
        <p className="text-sm">Computador: GUILHERME</p>
        <p className="text-sm">
          Servidor: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </footer>
    </>
  );
};

export default MainContent;
