import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NovaComanda from "../components/NovaComanda";
import ComandaProcesso from "../components/ComandaProcesso";

const IniciarVenda = () => {
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const navigate = useNavigate();
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMesas = async () => {
    try {
      const response = await fetch("http://10.11.1.67:5000/mesas");
      if (response.ok) {
        let mesasData = await response.json();

        // ✅ Garante que `status` seja booleano e atualizado corretamente
        const novasMesas = mesasData.map((mesa) => ({
          ...mesa,
          status: Boolean(mesa.status),
        }));

        setMesas(novasMesas.sort((a, b) => a.numero - b.numero));
      } else {
        console.error("Erro ao carregar mesas.");
      }
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
    }
  };

  // 🔥 Agora chamamos `fetchMesas()` sempre que o estado mudar
  useEffect(() => {
    fetchMesas();
  }, []);

  useEffect(() => {
    fetchMesas();
  }, [loading]); // ✅ Agora só depende de `loading`

  const handleAtualizarStatusMesa = async (mesaId, status) => {
    try {
      // 🔥 Corrige qualquer tipo errado e garante que só pode ser `true` ou `false`
      const booleanStatus = status === true || status === "true";

      console.log(
        `📡 Enviando para o backend:`,
        JSON.stringify({ status: booleanStatus })
      ); // 🚀 Veja no console se está correto

      const response = await fetch(
        `http://10.11.1.67:5000/mesas/${mesaId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: booleanStatus }), // ✅ Agora só envia `true` ou `false`
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error("❌ Erro ao atualizar status da mesa:", responseData);
        alert(
          `Erro ao atualizar status da mesa: ${
            responseData.error || "Erro desconhecido"
          }`
        );
      } else {
        console.log(
          `✅ Status atualizado com sucesso: mesaId=${mesaId}, status=${booleanStatus}`
        );
        fetchMesas(); // 🔄 Atualiza a UI
      }
    } catch (error) {
      console.error(
        "❌ Erro ao conectar ao servidor para atualizar mesa:",
        error
      );
      alert("Erro de conexão com o servidor ao atualizar a mesa.");
    }
  };

  const handleAbrirComanda = async () => {
    if (!selectedMesa || !selectedMesa.id) {
      alert("Selecione uma mesa para abrir a comanda.");
      return;
    }

    try {
      const response = await fetch("http://10.11.1.67:5000/comandas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa_id: selectedMesa.id,
        }),
      });

      if (response.ok) {
        console.log(`✅ Comanda aberta na mesa ${selectedMesa.id}`);

        // 🔄 Atualiza o status da mesa no frontend imediatamente
        setMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa.id === selectedMesa.id ? { ...mesa, status: true } : mesa
          )
        );

        // ✅ Agora ele redireciona para a comanda recém-aberta
        navigate(`/comanda-aberta/${selectedMesa.id}`);
      } else {
        const errorResponse = await response.json();
        console.error("❌ Erro ao abrir comanda:", errorResponse);
        alert(
          `Erro ao abrir comanda: ${errorResponse.error || "Erro desconhecido"}`
        );
      }
    } catch (error) {
      console.error("❌ Erro ao abrir comanda:", error);
      alert("Erro de conexão com o servidor ao abrir a comanda.");
    }
  };

  const handleSelecionarMesa = async (mesa) => {
    console.log(
      `🖱️ Clicou na mesa ${mesa.id}, verificando se há comanda aberta...`
    );

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/comandas/mesa/${mesa.id}`
      );
      const comanda = await response.json();

      if (!response.ok) {
        console.error(
          `❌ Erro ao verificar comanda da mesa ${mesa.id}:`,
          comanda
        );
        return;
      }

      console.log(`📡 Resposta do backend para mesa ${mesa.id}:`, comanda);

      // 🔥 Se já existir uma comanda aberta, redirecionamos para ela
      if (comanda && comanda.id && comanda.status === true) {
        console.log(
          `✅ Mesa ${mesa.id} já tem uma comanda aberta. Redirecionando...`
        );
        navigate(`/comanda-aberta/${comanda.id}`);
        return;
      }

      // 🔥 Se não existir comanda aberta, vai para a tela de seleção de atendente
      console.log(
        `🔄 Nenhuma comanda aberta encontrada para a mesa ${mesa.id}. Criando nova comanda.`
      );
      navigate(`/nova-comanda/${mesa.id}`);
    } catch (error) {
      console.error(
        `❌ Erro ao conectar ao servidor para mesa ${mesa.id}:`,
        error
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {!selectedMesa ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 grid-rows-4 gap-6 max-w-screen-lg mx-auto">
          {/* 🔥 Agora a mesa fica vermelha corretamente quando ocupada */}
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              className={`w-24 h-24 md:w-28 md:h-28 text-lg font-semibold border rounded-lg shadow-md transition-transform ${
                mesa.status
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              } hover:scale-105`}
              onClick={() => {
                console.log(
                  `🖱️ Clicou na mesa ${mesa.id}! Status atual: ${mesa.status}`
                );
                handleAtualizarStatusMesa(mesa.id, !mesa.status);
                handleSelecionarMesa(mesa); // 🔥 Agora também redireciona corretamente
              }}
            >
              Mesa {mesa.numero}
            </button>
          ))}
        </div>
      ) : produtosCategoria.length === 0 ? (
        <NovaComanda
          selectedMesa={selectedMesa}
          clienteInfo={clienteInfo}
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
