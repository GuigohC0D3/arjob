import PropTypes from "prop-types";

const HistoricoComandas = ({ historicoComandas }) => {
  return (
    <div className="historico-comandas">
      <h3>Histórico de Comandas</h3>
      <ul>
        {historicoComandas.map((historico, index) => (
          <li key={index}>
            Mesa {historico.mesa} - Comanda {historico.comanda}
          </li>
        ))}
      </ul>
    </div>
  );
};

HistoricoComandas.propTypes = {
  historicoComandas: PropTypes.arrayOf(
    PropTypes.shape({
      mesa: PropTypes.number.isRequired,
      comanda: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default HistoricoComandas;
