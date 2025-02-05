import { useState, useEffect } from "react";
import NovaComanda from "../components/NovaComanda";
import ComandaProcesso from "../components/ComandaProcesso";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [cpfCliente, setCpfCliente] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [produtosCategoriaOriginal, setProdutosCategoriaOriginal] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [comandaId, setComandaId] = useState(null);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const response = await fetch("http://10.11.1.67:5000/mesas");
        if (response.ok) {
          const mesasData = await response.json();
          const mesasOrdenadas = mesasData.sort((a, b) => a.numero - b.numero);
          setMesas(mesasOrdenadas);
        } else {
          console.error("Erro ao carregar mesas.");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };

    fetchMesas();
  }, []);

  const handleAbrirComanda = async () => {
    if (!selectedMesa || !selectedMesa.id) {
      alert("Selecione uma mesa para abrir a comanda.");
      return;
    }

    if (!cpfCliente || !clienteInfo) {
      alert("Insira e busque o CPF do cliente antes de abrir a comanda.");
      return;
    }

    try {
      const response = await fetch("http://10.11.1.67:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: selectedMesa.id,
          cliente_cpf: cpfCliente,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComandaId(data.id);

        setMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa.id === selectedMesa.id ? { ...mesa, status: "ocupada" } : mesa
          )
        );

        const produtosResponse = await fetch("http://10.11.1.67:5000/produtos");
        if (produtosResponse.ok) {
          const produtos = await produtosResponse.json();
          setProdutosCategoria(produtos);
          setProdutosCategoriaOriginal(produtos);
          const categoriasUnicas = [...new Set(produtos.map((p) => p.categoria))];
          setCategorias(categoriasUnicas);
        }
      } else {
        console.error("Erro ao abrir comanda:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao abrir comanda:", error);
    }
  };

  const acessarComandaOcupada = async (mesa) => {
    try {
      const response = await fetch(`http://10.11.1.67:5000/comandas/mesa/${mesa.id}`);
      if (response.ok) {
        const comandaData = await response.json();
        setComandaId(comandaData.id);
        setSelectedMesa(mesa);

        const produtosResponse = await fetch("http://10.11.1.67:5000/produtos");
        if (produtosResponse.ok) {
          const produtos = await produtosResponse.json();
          setProdutosCategoria(produtos);
          setProdutosCategoriaOriginal(produtos);

          const categoriasUnicas = [...new Set(produtos.map((produto) => produto.categoria))];
          setCategorias(categoriasUnicas);
        }
      } else {
        const errorData = await response.json();
        console.error("Erro ao acessar comanda ocupada:", errorData);
        alert(errorData.error || "Erro ao acessar comanda.");
      }
    } catch (error) {
      console.error("Erro ao acessar comanda ocupada:", error);
      alert("Erro ao acessar comanda. Verifique sua conexão.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!selectedMesa ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 grid-rows-4 gap-6 max-w-screen-lg mx-auto">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              className={`w-24 h-24 md:w-28 md:h-28 text-lg font-semibold border rounded-lg shadow-md transition-transform
                ${mesa.status === "ocupada" ? "bg-red-500 text-white" : "bg-green-500 text-white"}
                hover:scale-105`}
              onClick={() =>
                mesa.status === "ocupada"
                  ? acessarComandaOcupada(mesa)
                  : setSelectedMesa(mesa)
              }
            >
              Mesa {mesa.numero}
            </button>
          ))}
        </div>
      ) : produtosCategoria.length === 0 ? (
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
          comandaId={String(comandaId)}
          cpfInfo={{ cpf: cpfCliente }}
          produtosCategoria={produtosCategoria}
          categorias={categorias}
          setProdutosCategoria={setProdutosCategoria}
          produtosCategoriaOriginal={produtosCategoriaOriginal}
          mostrarFiltro={mostrarFiltro}
          setMostrarFiltro={setMostrarFiltro}
          onFecharComanda={() => setSelectedMesa(null)}
          onAtualizarMesas={setMesas}
          onBack={() => setSelectedMesa(null)}
        />
      )}
    </div>
  );
};

export default IniciarVenda;