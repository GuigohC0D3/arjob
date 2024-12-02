import './MainContent.css'

const MainContent = () => {
  return (
    <div className="main-content">
      <h1 className="title">COMANDA LIVRE</h1>
      <p className="subtitle">Pressione F2 para iniciar a comanda ou <br/>Pressione CTRL + F para fechar a comanda</p>
      <div className="logo">
        <span>ARJOB</span>
      </div>

      <div className="footer">
        <p>Operador: ADMINISTRADOR</p>
        <p>Computador: CLEITON</p>
        <p>Servidor: 16/10/2023 16:18</p>
      </div>
    </div>
  );
};

export default MainContent;
