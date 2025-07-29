import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const FecharComanda = ({
  selectedMesa,
  clienteInfo,
  comandaItens,
  pagamento,
  total,
  onFecharComanda,
}) => {
  const [tiposPagamento, setTiposPagamento] = useState([]);
  const [pagamentoId, setPagamentoId] = useState(null);

  // Carregar tipos de pagamento
  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        const response = await fetch("http://10.11.1.80:5000/tipos_pagamento");
        const data = await response.json();
        setTiposPagamento(data);
      } catch (error) {
        console.error("Erro ao carregar métodos de pagamento", error);
      }
    };

    fetchPagamentos();
  }, []);

  const handleFecharComanda = async () => {
    if (!clienteInfo?.id) {
      alert("Cliente inválido!");
      return;
    }

    if (!pagamento?.id) {
      alert("Selecione uma forma de pagamento!");
      return;
    }

    const comanda = {
      cliente_id: clienteInfo.id, // ✅ Só o ID
      pagamento_id: pagamento.id, // ✅ Só o ID
      total: total,
      itens: comandaItens, // ✅ Os itens consumidos
    };

    console.log("Enviando dados para fechar comanda:", comanda);

    try {
      const response = await fetch(
        `http://10.11.1.80:5000/comandas/${selectedMesa.code}/fechar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comanda),
        }
      );

      if (response.ok) {
        alert("Comanda fechada com sucesso!");
        onFecharComanda(comanda);
      } else {
        const errorResponse = await response.json();
        console.error("Erro ao fechar comanda:", errorResponse);
        alert(`Erro: ${errorResponse.error || "Falha ao fechar comanda."}`);
      }
    } catch (error) {
      console.error("Erro ao fechar a comanda:", error);
      alert("Erro ao fechar a comanda. Verifique sua conexão.");
    }
  };

  return (
    <div className="mt-6">
      {/* Select de pagamento */}
      <div className="mb-4">
        <label htmlFor="pagamento" className="block font-medium mb-1">
          Forma de Pagamento
        </label>
        <select
          id="pagamento"
          value={pagamentoId || ""}
          onChange={(e) => setPagamentoId(parseInt(e.target.value))}
          className="border rounded px-4 py-2 w-full"
        >
          <option value="">Selecione o pagamento</option>
          {tiposPagamento.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nome}
            </option>
          ))}
        </select>
      </div>

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
    code: PropTypes.string.isRequired, // ✅ Código da comanda (ex: "YLPCDV")
  }).isRequired,

  clienteInfo: PropTypes.shape({
    id: PropTypes.number.isRequired, // ✅ Importante pro backend
    nome: PropTypes.string.isRequired, // Nome visível no frontend
  }).isRequired,

  cpfInfo: PropTypes.shape({
    cpf: PropTypes.string.isRequired, // Se quiser exibir no frontend (opcional no backend)
  }),

  comandaItens: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired, // ✅ ID do produto
      nome: PropTypes.string.isRequired, // Nome do produto (opcional no backend)
      preco: PropTypes.oneOfType([
        // Preço unitário
        PropTypes.number,
        PropTypes.string,
      ]).isRequired,
      quantidade: PropTypes.number.isRequired, // ✅ Quantidade vendida
    })
  ).isRequired,

  total: PropTypes.number.isRequired, // ✅ Total geral da comanda

  onFecharComanda: PropTypes.func.isRequired, // ✅ Callback após fechar comanda
};

export default FecharComanda;
