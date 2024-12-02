import "./MainContent.css";

const MainContent = () => {
  return (
    <main className="main-content">
      <h1 className="title">COMANDA LIVRE</h1>
      <p className="subtitle">
        Pressione F2 para iniciar a comanda <br/>/Pressione CTRL + F para fechar
        a comanda
      </p>
      <div className="logo">ARJOB</div>
      <footer className="footer">
        <span>POV: 001</span>
        <span>Operador: ADMINISTRADOR</span>
        <span>Computador: CLEITON</span>
        <span>Servidor</span>
        <span>16/10/2023 16:18</span>
      </footer>
    </main>
  );
};

export default MainContent;
