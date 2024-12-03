import { useComanda } from "./ComandaContext"; // Importando o hook para o contexto
import "./ComandasListagem.css";

const ComandasListagem = () => {
  const { comandas } = useComanda(); // Acessando as comandas do contexto

  return (
    <div className="comandas-listagem">
      <h1>Lista de Comandas</h1>
      <ul>
        {comandas.map((comanda, index) => (
          <li key={index} className="comanda-item">
            <p>
              <strong>Cliente:</strong> {comanda.cliente.nome} - <strong>Mesa:</strong> {comanda.cliente.mesa}
            </p>
            <p><strong>Status:</strong> {comanda.status}</p>
            <p><strong>Total:</strong> R${comanda.total.toFixed(2)}</p>
            <p><strong>Data de Abertura:</strong> {comanda.data}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComandasListagem;
