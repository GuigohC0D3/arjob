import PropTypes from "prop-types";

const ComandaItens = ({ comandaItens, handleAdicionarProduto, handleRemoverProduto, total }) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-center">Itens na Comanda</h3>
      {comandaItens.length > 0 ? (
        <div className="bg-gray-200 rounded-lg shadow-md p-4">
          {comandaItens.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="font-bold">{item.nome}</p>
                <p className="text-sm text-gray-600">
                  R$ {parseFloat(item.preco).toFixed(2)} x {item.quantidade}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  onClick={() => handleAdicionarProduto(item)}
                >
                  +
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  onClick={() => handleRemoverProduto(item.id)}
                >
                  -
                </button>
              </div>
            </div>
          ))}
          <p className="text-xl font-bold text-right mt-4">
            Total: R$ {total.toFixed(2)}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">Nenhum item adicionado.</p>
      )}
    </div>
  );
};

ComandaItens.propTypes = {
  comandaItens: PropTypes.array.isRequired,
  handleAdicionarProduto: PropTypes.func.isRequired,
  handleRemoverProduto: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
};

export default ComandaItens;
