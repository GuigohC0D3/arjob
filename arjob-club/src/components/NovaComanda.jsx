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
        `http://127.0.0.1:5000/clientes/${cpfCliente}`
      );
      if (response.ok) {
        const cliente = await response.json();
  
        // Verifica se o backend retorna um array e extrai o primeiro elemento
        if (Array.isArray(cliente)) {
          setClienteInfo(cliente[0]); // Assume que o cliente está no índice 0
        } else {
          setClienteInfo(cliente); // Caso o backend retorne diretamente um objeto
          alert(`Cliente encontrado: ${cliente?.nome}`);
        }
      } else {
        const errorData = await response.json();
        setClienteInfo(null); // Limpa as informações do cliente
        alert(errorData.error || "Cliente não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      alert("Erro ao buscar cliente. Verifique sua conexão com o servidor.");
    }
  };  

  return (
    <div className="nova-comanda">
      {loading && <p>Carregando...</p>}

      <h2>Abrir Comanda</h2>
      <p>Mesa: {selectedMesa.numero}</p>

      <div className="cpf-container">
        <label htmlFor="cpf-input">
          CPF do Cliente:
          <input
            id="cpf-input"
            type="text"
            value={cpfCliente}
            onChange={handleCpfChange}
            placeholder="Digite o CPF (123.456.789-00)"
          />
        </label>
        <button onClick={handleBuscarCliente} disabled={loading}>
          Buscar Cliente
        </button>
      </div>

      <div className="cliente-info">
        <h3>Informações do Cliente</h3>
        {clienteInfo ? (
          <>
            <p>Nome: {clienteInfo.nome}</p>
            <p>CPF: {clienteInfo.cpf}</p>
          </>
        ) : (
          <p className="info-user">Nenhum cliente encontrado.</p>
        )}
      </div>

      <div className="actions">
        <button
          onClick={onAbrirComanda}
          disabled={!clienteInfo || loading}
          className="primary"
        >
          Gerar e Abrir Comanda
        </button>
        <button onClick={onBack} className="secondary">
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
  }), // Garante que é um objeto
  setCpfCliente: PropTypes.func.isRequired,
  setClienteInfo: PropTypes.func.isRequired,
  onAbrirComanda: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};


export default NovaComanda;
