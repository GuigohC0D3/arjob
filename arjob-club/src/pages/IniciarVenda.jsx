import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NovaComanda from "../components/NovaComanda";
import ComandaProcesso from "../components/ComandaProcesso";
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const navigate = useNavigate();

  // Estados principais
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [cpfCliente, setCpfCliente] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [produtosCategoriaOriginal, setProdutosCategoriaOriginal] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  const [loading, setLoading] = useState(false);
  const [comandaAberta, setComandaAberta] = useState(null);

  // Carregar mesas ao montar o componente
  useEffect(() => {
    const fetchMesas = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5000/mesas");
        if (response.ok) {
          const data = await response.json();
          setMesas(data);
        } else {
          console.error("Erro ao carregar mesas.");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMesas();
  }, []);

  // Abrir nova comanda
  const handleAbrirComanda = async () => {
    if (!selectedMesa || !selectedMesa.id) {
      alert("Selecione uma mesa para abrir a comanda.");
      return;
    }

    if (!cpfCliente || !clienteInfo) {
      alert("Insira e busque o CPF do cliente antes de abrir a comanda.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: selectedMesa.id,
          cliente_cpf: cpfCliente,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComandaAberta(data);

        // Carregar produtos disponíveis
        const produtosResponse = await fetch("http://127.0.0.1:5000/produtos");
        if (produtosResponse.ok) {
          const produtos = await produtosResponse.json();
          setProdutosCategoria(produtos);
          setProdutosCategoriaOriginal(produtos);

          // Organizar categorias únicas
          const categoriasUnicas = [
            ...new Set(produtos.map((produto) => produto.categoria)),
          ];
          setCategorias(categoriasUnicas);
        } else {
          console.error("Erro ao carregar produtos.");
        }
      } else {
        const errorData = await response.json();
        console.error("Erro do servidor ao abrir comanda:", errorData);
      }
    } catch (error) {
      console.error("Erro ao abrir comanda:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fechar comanda e redirecionar para o histórico
  const handleFecharComanda = (comanda) => {
    console.log("Comanda fechada:", comanda);
    navigate("/historico", { state: { comanda } });
  };

  return (
    <div>
      {loading && <p>Carregando...</p>}

      {!selectedMesa ? (
        <div className="mesas-container">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              className={`mesa ${
                mesa.status === "ocupada" ? "ocupada" : "disponivel"
              }`}
              onClick={() => setSelectedMesa(mesa)}
            >
              Mesa {mesa.numero}
            </button>
          ))}
        </div>
      ) : !comandaAberta ? (
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
        <ComandaProcesso
          selectedMesa={selectedMesa}
          clienteInfo={clienteInfo}
          cpfInfo={{ cpf: cpfCliente }} // CPF sendo passado como objeto
          produtosCategoria={produtosCategoria}
          categorias={categorias}
          setProdutosCategoria={setProdutosCategoria}
          produtosCategoriaOriginal={produtosCategoriaOriginal}
          mostrarFiltro={mostrarFiltro}
          setMostrarFiltro={setMostrarFiltro}
          onFecharComanda={handleFecharComanda}
          onBack={() => setComandaAberta(null)}
        />
      )}
    </div>
  );
};

export default IniciarVenda;
