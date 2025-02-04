import { useState } from "react";
import PropTypes from "prop-types";

const NovaComanda = ({
  selectedMesa,
  cpfCliente,
  clienteInfo,
  setCpfCliente,
  setClienteInfo,
  onAbrirComanda,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const formattedCPF = value
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14); // Formata o CPF no padrão 123.456.789-00
    setCpfCliente(formattedCPF);
  };

  const handleBuscarCliente = async () => {
    if (!cpfCliente || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpfCliente)) {
      alert("Digite um CPF válido no formato XXX.XXX.XXX-XX.");
      return;
    }

    try {
      const response = await fetch(
        `http://10.11.1.67:5000/clientes/${cpfCliente}`
      );
      const data = await response.json();

      console.log("Resposta da API:", data); // Log para ver a resposta real da API

      if (response.ok) {
        if (Array.isArray(data) && data.length > 0) {
          setClienteInfo(data[0]);
        } else if (typeof data === "object" && data !== null) {
          setClienteInfo(data);
          alert(`Cliente encontrado: ${data?.nome}`);
        } else {
          setClienteInfo(null);
          alert("Cliente não encontrado.");
        }
      } else {
        setClienteInfo(null);
        alert(data.error || "Cliente não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      alert("Erro ao buscar cliente. Verifique sua conexão com o servidor.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
        Abrir Comanda
      </h2>

      <p className="text-lg text-gray-600 font-medium text-center mb-4">
        Mesa:{" "}
        <span className="font-bold text-gray-800">{selectedMesa.numero}</span>
      </p>

      {/* CPF Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CPF do Cliente:
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={cpfCliente}
            onChange={handleCpfChange}
            placeholder="123.456.789-00"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleBuscarCliente}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-200"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Cliente Info */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Informações do Cliente
        </h3>
        {clienteInfo ? (
          <div className="text-gray-600">
            <p>
              <span className="font-bold">Nome:</span> {clienteInfo.nome}
            </p>
            <p>
              <span className="font-bold">CPF:</span> {clienteInfo.cpf}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">Nenhum cliente encontrado.</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 gap-8 flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
        <button
          onClick={onAbrirComanda}
          disabled={!clienteInfo || loading}
          className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Gerar e Abrir Comanda
        </button>
        <button
          onClick={onBack}
          className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

NovaComanda.propTypes = {
  selectedMesa: PropTypes.shape({
    id: PropTypes.number.isRequired,
    numero: PropTypes.number.isRequired,
  }).isRequired,
  cpfCliente: PropTypes.string.isRequired,
  clienteInfo: PropTypes.shape({
    nome: PropTypes.string,
    cpf: PropTypes.string,
  }),
  setCpfCliente: PropTypes.func.isRequired,
  setClienteInfo: PropTypes.func.isRequired,
  onAbrirComanda: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default NovaComanda;
