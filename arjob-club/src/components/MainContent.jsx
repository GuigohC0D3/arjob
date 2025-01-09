import './MainContent.css'

const MainContent = () => {
  return (
    <>
      {/* Conteúdo principal */}
      <main className="main">
        <div className="logo">ARJOB</div>
      </main>

      {/* Rodapé */}
      <footer className="footer">
        <p>Operador: ADMINISTRADOR</p>
        <br />
        <p>Computador: GUILHERME</p>
        <br />
        <p>Servidor: 16/10/2023 16:18</p>
      </footer>
    </>
  );
};

export default MainContent;
