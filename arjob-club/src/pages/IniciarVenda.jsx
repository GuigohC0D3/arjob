import { useState, useEffect } from "react";
import NovaComanda from "../components/NovaComanda";
import ComandaProcesso from "../components/ComandaProcesso";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [cpfCliente, setCpfCliente] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [produtosCategoriaOriginal, setProdutosCategoriaOriginal] = useState(
    []
  );
  const [categorias, setCategorias] = useState([]);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [comandaId, setComandaId] = useState(null);
  const [loading, setLoading] = useState(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchMesas();
  }, [loading]);
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
          comanda_id: comandaId.id,
          mesa_id: selectedMesa.id,
          cliente_cpf: cpfCliente,
          mesa: comandaId,
        }),
      });
      if (response.ok) {
        // Verifica se a mesa está ocupada

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
          const categoriasUnicas = [
            ...new Set(produtos.map((p) => p.categoria)),
          ];
          setCategorias(categoriasUnicas);
          setLoading(true);
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
      const response = await fetch(
        `http://10.11.1.67:5000/comandas/mesa/${mesa.id}`
      );
      if (response.ok) {
        const comandaData = await response.json();

        if (!comandaData.code || comandaData.code === "MISSING_CODE") {
          alert("Erro: Código da comanda não encontrado no backend.");
          return;
        }

        setComandaId(comandaData.id);
        setSelectedMesa({
          ...mesa,
          code: comandaData.code, // 🔥 Agora garantimos que `code` sempre vem da API
        });
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
          {/* Botão que seleciona a mesa e verifica se estiver ocupada fica vermelho e se estiver disponível fica verde */}
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              className={`w-24 h-24 md:w-28 md:h-28 text-lg font-semibold border rounded-lg shadow-md transition-transform
              ${
                mesa.status
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }
              hover:scale-105`}
              onClick={() => {
                mesa.status
                  ? acessarComandaOcupada(mesa)
                  : setSelectedMesa(mesa),
                  setComandaId(mesa.id);
              }}
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
          selectedMesa={{
            ...selectedMesa,
            code: selectedMesa.code ?? "",
            status: Boolean(selectedMesa.status),
          }}
          clienteInfo={clienteInfo || { nome: "Cliente Desconhecido" }}
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
