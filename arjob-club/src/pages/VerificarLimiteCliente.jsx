// VerificarLimiteCliente.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const VerificarLimiteCliente = ({ clienteId }) => {
  const [limiteInfo, setLimiteInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clienteId) return; // se nenhum cliente for selecionado, não faz nada
    const fetchLimite = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/clientes/${clienteId}/limite`
        );
        const data = await response.json();
        if (response.ok) {
          setLimiteInfo(data);
        } else {
          setError(data.error || "Erro ao consultar limite");
        }
      } catch (err) {
        console.error("Erro ao buscar limite do cliente:", err);
        setError("Erro ao conectar ao servidor");
      }
    };

    fetchLimite();
  }, [clienteId]);

  if (!clienteId) return <p>Selecione um cliente para verificar o limite.</p>;
  if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;
  if (!limiteInfo) return <p>Carregando informações do limite...</p>;

  return (
    <div className="limite-container p-4 border rounded bg-gray-100 mt-4">
      <h3 className="text-lg font-bold mb-2">Limite do Convênio do Cliente</h3>
      <p>
        <strong>Limite:</strong> R$ {limiteInfo.limite.toFixed(2)}
      </p>
      <p>
        <strong>Consumido:</strong> R$ {limiteInfo.consumido.toFixed(2)}
      </p>
      <p>
        <strong>Saldo:</strong> R$ {limiteInfo.disponivel.toFixed(2)}
      </p>
      <p>
        <strong>Status:</strong> {limiteInfo.status}
      </p>
    </div>
  );
};

VerificarLimiteCliente.propTypes = {
  clienteId: PropTypes.number.isRequired,
};

export default VerificarLimiteCliente;
