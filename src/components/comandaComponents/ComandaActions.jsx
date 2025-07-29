import PropTypes from "prop-types";

const ComandaActions = ({ handleFecharComanda, onBack }) => {
  return (
    <div className="mt-6 flex justify-between">
      <button
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
        onClick={handleFecharComanda}
      >
        Fechar Comanda
      </button>
      <button
        className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition"
        onClick={onBack}
      >
        Voltar
      </button>
    </div>
  );
};

ComandaActions.propTypes = {
  handleFecharComanda: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ComandaActions;