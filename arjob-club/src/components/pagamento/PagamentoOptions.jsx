import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const PagamentoOptions = ({ onSelect, clienteSelecionado }) => {
  const [opcoes, setOpcoes] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    const fetchOpcoes = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/pagamentos/tipos");
        if (response.ok) {
          const data = await response.json();
          setOpcoes(data);
        } else {
          console.error("Erro ao buscar tipos de pagamento");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor", error);
      }
    };

    fetchOpcoes();
  }, []);

  const handleChange = (event) => {
    const selectedId = event.target.value;
    setSelectedOption(selectedId);

    const opcaoSelecionada = opcoes.find(
      (opcao) => opcao.id.toString() === selectedId
    );
    if (opcaoSelecionada) {
      onSelect(opcaoSelecionada);
    }
  };

  return (
    <div className="mt-4">
      <select
        value={selectedOption}
        onChange={handleChange}
        className="
          w-full
          px-3
          py-2
          bg-white
          border border-gray-300
          rounded-md
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
          focus:ring-offset-1
          text-gray-800
          text-sm
          font-medium
          transition
          duration-200
          ease-in-out
        "
      >
        <option value="">Selecione uma opção</option>
        {opcoes.map((opcao) => {
          // 🔒 Se o cliente estiver bloqueado, escondemos a opção "Convênio"
          if (
            opcao.nome.toLowerCase() === "convênio" &&
            clienteSelecionado?.bloqueado
          ) {
            return null;
          }

          return (
            <option key={opcao.id} value={opcao.id}>
              {opcao.nome}
            </option>
          );
        })}
      </select>

      {/* ⚠️ Aviso visual se o convênio estiver bloqueado */}
      {clienteSelecionado?.bloqueado && (
        <p className="text-red-500 text-sm mt-2">
          ⚠️ Convênio indisponível – limite atingido
        </p>
      )}
    </div>
  );
};

PagamentoOptions.propTypes = {
  onSelect: PropTypes.func.isRequired,
  clienteSelecionado: PropTypes.object, // agora aceita o cliente como prop
};

export default PagamentoOptions;
