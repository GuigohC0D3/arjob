import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import debounce from "lodash.debounce"; // Debounce para otimizar a busca

const SelecionarClientes = ({ onSelectCliente }) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [searchInput, setSearchInput] = useState("");

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

          // Ordena por nome para melhorar a UX
          const clientesOrdenados = clientesArray.sort((a, b) =>
            a.nome.localeCompare(b.nome)
          );

          setClientes(clientesOrdenados);
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

  // ✅ Debounced search input (caso queira fazer buscas remotas depois)
  const debouncedSearch = useMemo(() => debounce(setSearchInput, 300), []);

  // ✅ Mapeando os clientes para opções do Select, filtrados por searchInput
  const options = useMemo(() => {
    return clientes
      .filter((cliente) =>
        cliente.nome.toLowerCase().includes(searchInput.toLowerCase())
      )
      .map((cliente) => ({
        value: cliente.cpf,
        label: `${cliente.nome} - ${cliente.cpf}`,
        data: cliente, // pra usar no onChange depois
      }));
  }, [clientes, searchInput]);

  const handleChange = (selectedOption) => {
    setClienteSelecionado(selectedOption);
    onSelectCliente(selectedOption?.data || null); // devolve o cliente completo
  };

  const handleInputChange = (inputValue) => {
    debouncedSearch(inputValue);
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
        onInputChange={handleInputChange}
        placeholder="Digite o nome ou CPF do cliente..."
        isSearchable
        noOptionsMessage={() =>
          searchInput
            ? "Nenhum cliente encontrado com esse nome/CPF"
            : "Nenhum cliente disponível"
        }
        styles={{
          control: (provided, state) => ({
            ...provided,
            borderRadius: "0.375rem",
            padding: "2px",
            borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
            boxShadow: "none",
            "&:hover": { borderColor: "#2563eb" },
            fontSize: "0.875rem",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? "#2563eb"
              : state.isFocused
              ? "#bfdbfe"
              : "#ffffff",
            color: state.isSelected ? "#ffffff" : "#1f2937",
            cursor: "pointer",
          }),
          menu: (provided) => ({
            ...provided,
            zIndex: 50,
          }),
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 6,
          colors: {
            ...theme.colors,
            primary25: "#bfdbfe",
            primary: "#2563eb",
          },
        })}
      />
    </div>
  );
};

SelecionarClientes.propTypes = {
  onSelectCliente: PropTypes.func.isRequired,
};

export default SelecionarClientes;
