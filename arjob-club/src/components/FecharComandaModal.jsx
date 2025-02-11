import PropTypes from "prop-types";

const FecharComanda = ({
  selectedMesa,
  clienteInfo,
  cpfInfo,
  comandaItens,
  total,
  onFecharComanda,
}) => {
  const handleFecharComanda = async () => {
    const comanda = {
      mesa: selectedMesa.numero,
      cliente: clienteInfo?.nome,
      cpf: cpfInfo?.cpf,
      itens: comandaItens,
      total,
    };

    console.log("Fechando comanda:", comanda);

    try {
      // Enviar comanda para o backend
      const response = await fetch("http://10.11.1.67:5000/comandas/fechar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...comanda,
          mesa_id: selectedMesa.id,
        }),
      });

      if (response.ok) {
        alert("Comanda fechada com sucesso! A mesa foi liberada.");
        onFecharComanda(comanda); // Atualiza o estado no componente pai
      } else {
        alert("Erro ao fechar a comanda. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao fechar a comanda:", error);
      alert("Erro ao fechar a comanda. Verifique sua conexão.");
    }
  };

  return (
    <div className="mt-6">
      <button
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-300"
        onClick={handleFecharComanda}
      >
        Fechar Comanda
      </button>
    </div>
  );
};

FecharComanda.propTypes = {
  selectedMesa: PropTypes.shape({
    id: PropTypes.number.isRequired,
    numero: PropTypes.number.isRequired,
  }).isRequired,
  clienteInfo: PropTypes.shape({
    nome: PropTypes.string,
  }).isRequired,
  cpfInfo: PropTypes.shape({
    cpf: PropTypes.string,
  }).isRequired,
  comandaItens: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
      preco: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      quantidade: PropTypes.number.isRequired,
    })
  ).isRequired,
  total: PropTypes.number.isRequired,
  onFecharComanda: PropTypes.func.isRequired,
};

export default FecharComanda;