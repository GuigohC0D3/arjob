import PropTypes from "prop-types";

const ComandaHeader = ({ selectedMesa, clienteInfo, cpfInfo }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">
        Comanda - Mesa {selectedMesa.numero}
      </h2>
      <p className="text-lg text-gray-700">
        <span className="font-semibold">Nome:</span> {clienteInfo?.nome || "Desconhecido"}
      </p>
      <p className="text-lg text-gray-700">
        <span className="font-semibold">CPF:</span> {cpfInfo?.cpf || "Não informado"}
      </p>
    </div>
  );
};

ComandaHeader.propTypes = {
  selectedMesa: PropTypes.object.isRequired,
  clienteInfo: PropTypes.object.isRequired,
  cpfInfo: PropTypes.object.isRequired,
};

export default ComandaHeader;
