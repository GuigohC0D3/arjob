import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const SelecionarClientes = ({ onSelectCliente }) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/clientes");
        if (response.ok) {
          const data = await response.json();

          console.log("Dados brutos recebidos de /clientes:", data);

          const clientesArray = Array.isArray(data)
            ? data
            : data.data || [];

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

  const handleChange = (event) => {
    const cpf = event.target.value;
    setClienteSelecionado(cpf);

    const cliente = clientes.find((c) => c.cpf === cpf);
    if (cliente) {
      onSelectCliente(cliente);
    }
  };

  return (
    <div className="mb-4 mt-4">
      <select
        value={clienteSelecionado}
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
        <option value="">Selecione um cliente</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.cpf}>
            {cliente.nome} - {cliente.cpf}
          </option>
        ))}
      </select>
    </div>
  );
};

SelecionarClientes.propTypes = {
  onSelectCliente: PropTypes.func.isRequired,
};

export default SelecionarClientes;
