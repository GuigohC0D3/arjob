import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MesaList from "../components/MesaList";
import NovaComanda from "../components/NovaComanda";
import ComandaAberta from "../components/ComandaProcesso";
import HistoricoComandas from "../components/HistoricoComandas";
import FecharComandaModal from "../components/FecharComandaModal";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const navigate = useNavigate();

  // Estados principais
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [comandas, setComandas] = useState({});
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [produtosCategoriaOriginal, setProdutosCategoriaOriginal] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [historicoComandas, setHistoricoComandas] = useState([]);

  // Estados auxiliares
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [mostrarFecharComanda, setMostrarFecharComanda] = useState(false);
  const [comandaDetalhes, setComandaDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cpfCliente, setCpfCliente] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);

  // Funções de ciclo de vida e lógica principal (mesas, comandas, etc.)
  useEffect(() => {
    const fetchMesas = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5000/mesas");
        if (response.ok) {
          const data = await response.json();
          setMesas(data);
        } else {
          console.error("Erro ao carregar mesas");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesas();
  }, []);

  const handleAbrirComanda = async () => {
    // (Lógica para abrir comanda...)
  };

  const handleFecharComandaClick = async () => {
    // (Lógica para fechar comanda...)
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {!selectedMesa ? (
        <MesaList mesas={mesas} onSelectMesa={setSelectedMesa} />
      ) : !comandas[selectedMesa.id] ? (
        <NovaComanda
          selectedMesa={selectedMesa}
          cpfCliente={cpfCliente}
          clienteInfo={clienteInfo}
          setCpfCliente={setCpfCliente}
          setClienteInfo={setClienteInfo}
          onAbrirComanda={handleAbrirComanda}
          onBack={() => setSelectedMesa(null)}
        />
      ) : (
        <ComandaAberta
          selectedMesa={selectedMesa}
          clienteInfo={clienteInfo}
          produtosCategoria={produtosCategoria}
          categorias={categorias}
          setProdutosCategoria={setProdutosCategoria}
          produtosCategoriaOriginal={produtosCategoriaOriginal}
          mostrarFiltro={mostrarFiltro}
          setMostrarFiltro={setMostrarFiltro}
          onFecharComanda={handleFecharComandaClick}
          onBack={() => setSelectedMesa(null)}
        />
      )}
      <HistoricoComandas historicoComandas={historicoComandas} />
      {mostrarFecharComanda && (
        <FecharComandaModal
          comandaDetalhes={comandaDetalhes}
          onConfirm={handleFecharComandaClick}
          onCancel={() => setMostrarFecharComanda(false)}
        />
      )}
    </div>
  );
};

export default IniciarVenda;
