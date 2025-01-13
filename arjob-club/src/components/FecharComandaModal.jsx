import PropTypes from "prop-types";

const FecharComandaModal = ({ comandaDetalhes, onConfirm, onCancel }) => {
  return (
    <div className="modal">
      <h2>Fechar Comanda</h2>
      <p>Mesa: {comandaDetalhes?.mesa}</p>
      <p>Total: R$ {comandaDetalhes?.total?.toFixed(2)}</p>
      <ul>
        {comandaDetalhes?.itens.map((item) => (
          <li key={item.id}>
            {item.nome} - R$ {item.preco.toFixed(2)}
          </li>
        ))}
      </ul>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
};

FecharComandaModal.propTypes = {
  comandaDetalhes: PropTypes.shape({
    mesa: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    itens: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        nome: PropTypes.string.isRequired,
        preco: PropTypes.number.isRequired,
      })
    ).isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default FecharComandaModal;
