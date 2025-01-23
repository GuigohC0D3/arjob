import { useState } from "react";
import api from "../../apiConfig";

const Filters = () => {
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const applyFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/admin/search?query=${filter}`
      );
      setResults(response.data);
    } catch (err) {
      setError("Erro ao buscar resultados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Filtros</h2>
      <p>Use os filtros abaixo para buscar informações específicas:</p>
      <input
        type="text"
        placeholder="Buscar por nome ou email"
        value={filter}
        onChange={handleFilterChange}
      />
      <button onClick={applyFilter} disabled={loading}>
        Aplicar Filtro
      </button>
      {loading && <p>Carregando resultados...</p>}
      {error && <p>{error}</p>}
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
    </div>
  );
};

export default Filters;