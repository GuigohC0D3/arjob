import PropTypes from "prop-types";

const MesaList = ({ mesas, onSelectMesa }) => {
  return (
    <div className="mesas-container">
      {mesas.map((mesa) => (
        <button
          key={mesa.id}
          className={`mesa ${
            mesa.status === "ocupada" ? "ocupada" : "disponivel"
          }`}
          onClick={() => onSelectMesa(mesa)}
        >
          Mesa {mesa.numero}
        </button>
      ))}
    </div>
  );
};

MesaList.propTypes = {
  mesas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      numero: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSelectMesa: PropTypes.func.isRequired,
};

export default MesaList;
