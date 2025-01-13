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
    const cpfLimpo = cpfCliente.replace(/\D/g, ""); // Remove formatações
    if (!cpfLimpo) {
      alert("Por favor, insira um CPF válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/clientes/${cpfLimpo.trim()}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setClienteInfo(data[0]); // Pegamos o primeiro item do array
        } else {
          setClienteInfo(null);
          alert("Cliente não encontrado. Verifique o CPF.");
        }
      } else {
        setClienteInfo(null);
        alert("Cliente não encontrado. Verifique o CPF.");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nova-comanda">
      {loading && <p>Carregando...</p>}

      <h2>Abrir Comanda</h2>
      <p>Mesa: {selectedMesa.numero}</p>

      <div className="cpf-container">
        <label>
          CPF do Cliente:
          <input
            type="text"
            value={cpfCliente}
            onChange={handleCpfChange}
            placeholder="Digite o CPF (123.456.789-00)"
          />
        </label>
        <button onClick={handleBuscarCliente}>Buscar Cliente</button>
      </div>

      <div className="cliente-info">
        <h3>Informações do Cliente</h3>
        <p className="info-user">Nome: {clienteInfo?.nome || "Não encontrado"}</p>
        <p className="info-user">CPF: {clienteInfo?.cpf || "Não encontrado"}</p>
      </div>

      <button onClick={onAbrirComanda} disabled={!clienteInfo}>
        Gerar e Abrir Comanda
      </button>
      <button onClick={onBack}>Voltar</button>
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
