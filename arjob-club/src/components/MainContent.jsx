import './MainContent.css'

const MainContent = () => {
  return (
    <>
      {/* Cabeçalho */}
      <header className="header">
        <p className="subtitle">
          Pressione <strong>F2</strong> para iniciar a comanda ou <br />
          Pressione <strong>CTRL + F</strong> para fechar a comanda
        </p>
      </header>

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
