import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NovaComanda from "../components/NovaComanda";
import ComandaProcesso from "../components/ComandaProcesso";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [cpfCliente, setCpfCliente] = useState("");
  const [clienteInfo, setClienteInfo] = useState(null);
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const navigate = useNavigate();
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
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
          mesa_id: selectedMesa.id,
          cliente_cpf: cpfCliente,
        }),
      });

      if (response.ok) {
        setLoading(true); // 🔥 Faz o useEffect rodar de novo e buscar as mesas atualizadas
      } else {
        console.error("Erro ao abrir comanda:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao abrir comanda:", error);
    }
  };

  const handleSelecionarMesa = async (mesa) => {
    try {
      const response = await fetch(
        `http://10.11.1.67:5000/comandas/mesa/${mesa.id}`
      );
      if (response.ok) {
        const comanda = await response.json();
        if (comanda.aberta) {
          navigate(`/comanda-aberta/${mesa.id}`); // 🔥 Comanda já aberta, redireciona
        } else {
          navigate(`/nova-comanda/${mesa.id}`); // 🔥 Comanda fechada, pode abrir uma nova
        }
      } else {
        console.error("Erro ao verificar comanda da mesa.");
      }
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
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
              className={`w-24 h-24 md:w-28 md:h-28 text-lg font-semibold border rounded-lg shadow-md transition-transform ${
                mesa.status === "ocupada"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              } hover:scale-105`}
              onClick={() => handleSelecionarMesa(mesa)}
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
          cpfInfo={{ cpf: cpfCliente }}
          produtosCategoria={produtosCategoria}
          setProdutosCategoria={setProdutosCategoria}
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
