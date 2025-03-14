import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "react-select";

const SelecionarClientes = ({ onSelectCliente }) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/clientes");
        if (response.ok) {
          const data = await response.json();

          const clientesArray = Array.isArray(data) ? data : data.data || [];

          if (!Array.isArray(clientesArray)) {
            console.error(
              "Nenhum array de clientes encontrado:",
              clientesArray
            );
            setClientes([]);
            return;
          }

          setClientes(clientesArray);
        } else {
          console.error(
            "Erro na resposta da API de clientes:",
            response.status
          );
        }
      } catch (error) {
        console.error("Erro de conexão ao buscar clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  // ✅ Mapeando os clientes para opções do Select
  const options = clientes.map((cliente) => ({
    value: cliente.cpf,
    label: `${cliente.nome} - ${cliente.cpf}`,
    data: cliente, // pra usar no onChange depois
  }));

  const handleChange = (selectedOption) => {
    setClienteSelecionado(selectedOption);
    onSelectCliente(selectedOption.data); // devolve o cliente completo
  };

  return (
    <div className="mb-4 mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Selecione um cliente
      </label>

      <Select
        options={options}
        value={clienteSelecionado}
        onChange={handleChange}
        placeholder="Digite o nome ou CPF..."
        isSearchable
        noOptionsMessage={() => "Nenhum cliente encontrado"}
        styles={{
          control: (provided) => ({
            ...provided,
            borderRadius: "0.375rem",
            padding: "2px",
            borderColor: "#d1d5db",
            boxShadow: "none",
            "&:hover": { borderColor: "#2563eb" },
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#2563eb" : "#ffffff",
            color: state.isSelected ? "#ffffff" : "#1f2937",
            "&:hover": { backgroundColor: "#bfdbfe" },
          }),
        }}
      />
    </div>
  );
};

SelecionarClientes.propTypes = {
  onSelectCliente: PropTypes.func.isRequired,
};

export default SelecionarClientes;
