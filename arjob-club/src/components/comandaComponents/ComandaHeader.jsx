import PropTypes from "prop-types";

const ComandaHeader = ({ selectedMesa, clienteInfo, cpfInfo }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">
        Comanda - Mesa {selectedMesa.numero} ({selectedMesa.status === "ocupada" ? "🔴 Ocupada" : "🟢 Disponível"})
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
  selectedMesa: PropTypes.shape({
    numero: PropTypes.number.isRequired,
    status: PropTypes.string, // 🔥 Agora verifica o status da mesa corretamente
  }).isRequired,
  clienteInfo: PropTypes.shape({
    nome: PropTypes.string,
  }).isRequired,
  cpfInfo: PropTypes.shape({
    cpf: PropTypes.string,
  }).isRequired,
};

export default ComandaHeader;
