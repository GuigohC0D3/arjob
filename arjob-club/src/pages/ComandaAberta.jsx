import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paginator } from "primereact/paginator";
import { motion } from "framer-motion";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import PagamentoOptions from "../components/pagamento/PagamentoOptions";
import SelecionarClientes from "../components/selecionarClientes/SelecionarClientes";

const ComandaAberta = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [comandaItens, setComandaItens] = useState([]);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const produtosPorPagina = 8;
  const [loading, setLoading] = useState(true);

  // ✅ Adicionado o usuário logado (simulação)
  const [usuarioLogado] = useState({
    id: 1,
    nome: "Atendente Exemplo",
  });

  const handleFecharComanda = () => {
    if (comandaItens.length === 0) {
      confirmDialog({
        message: "Sua comanda está vazia! Adicione itens antes de fechar.",
        header: "Comanda Vazia",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Ok",
        rejectVisible: false,
      });
      return;
    }

    if (!pagamentoSelecionado || !clienteSelecionado) {
      confirmDialog({
        message:
          "Selecione um cliente e forma de pagamento antes de fechar a comanda.",
        header: "Informação Incompleta",
        icon: "pi pi-info-circle",
        acceptLabel: "Ok",
        rejectVisible: false,
        
      });
      return;
    }

    confirmarFechamentoComanda();
  };

  const confirmarFechamentoComanda = () => {
    confirmDialog({
      message: `Deseja realmente fechar a comanda no valor de R$ ${totalComanda.toFixed(
        2
      )}?`,
      header: "Confirmar Fechamento",
      icon: "pi pi-check-circle",
      acceptLabel: "Fechar",
      rejectLabel: "Cancelar",
      accept: () => fecharComanda(),
    });
  };

  const fetchProdutos = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/produtos");
      const data = await res.json();
      let produtosData = Array.isArray(data) ? data : data.produtos || [];

      if (Array.isArray(produtosData[0])) {
        produtosData = produtosData[0];
      }

      const produtosFormatados = produtosData.map((p) => ({
        id: p.id,
        nome: p.nome || "Sem Nome",
        preco: p.preco || 0,
        categoria: p.categoria || "Sem Categoria",
        estoque: p.estoque || 0,
      }));

      setProdutos(produtosFormatados);

      const categoriasUnicas = [
        ...new Set(produtosFormatados.map((p) => p.categoria).filter(Boolean)),
      ];

      setCategorias(categoriasUnicas);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItensComanda = useCallback(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/comandas/${mesaId}/itens`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.warn("Itens de comanda inválidos:", data);
        return;
      }

      setComandaItens(data);
    } catch (err) {
      console.error("Erro ao buscar itens da comanda:", err);
    }
  }, [mesaId]);

  useEffect(() => {
    fetchProdutos();
    fetchItensComanda();
  }, [fetchProdutos, fetchItensComanda]);

  const adicionarProduto = async (produto) => {
    if (!mesaId) return;

    try {
      await fetch(`http://127.0.0.1:5000/comandas/${mesaId}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto_id: produto.id,
          quantidade: 1,
          preco_unitario: produto.preco,
        }),
      });

      await fetchItensComanda();
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
    }
  };

  const incrementarQuantidade = async (item) => {
    if (!mesaId) return;

    try {
      await fetch(`http://127.0.0.1:5000/comandas/${mesaId}/itens/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: item.quantidade + 1 }),
      });

      await fetchItensComanda();
    } catch (err) {
      console.error("Erro ao incrementar quantidade:", err);
    }
  };

  const decrementarQuantidade = async (item) => {
    if (!mesaId) return;

    try {
      if (item.quantidade === 1) {
        await fetch(
          `http://127.0.0.1:5000/comandas/${mesaId}/itens/${item.id}`,
          {
            method: "DELETE",
          }
        );
      } else {
        await fetch(
          `http://127.0.0.1:5000/comandas/${mesaId}/itens/${item.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantidade: item.quantidade - 1 }),
          }
        );
      }

      await fetchItensComanda();
    } catch (err) {
      console.error("Erro ao decrementar quantidade:", err);
    }
  };

  const fecharComanda = async () => {
    const dadosParaEnviar = {
      cliente_id: clienteSelecionado.id,
      pagamento_id: pagamentoSelecionado.id,
      total: totalComanda,
      mesa_id: mesaId,
      itens: comandaItens,
      usuario_id: usuarioLogado.id,
    };
  
    console.log("📦 Enviando dados para histórico de comanda:", dadosParaEnviar);

    try {
      await fetch(`http://127.0.0.1:5000/comandas/${mesaId}/fechar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteSelecionado.id,
          pagamento_id: pagamentoSelecionado.id,
          total: totalComanda,
          mesa_id: mesaId,
          itens: comandaItens,
          usuario_id: usuarioLogado.id, // ✅ Adicionado o usuario_id aqui!
        }),
      });

      confirmDialog({
        message: "Comanda fechada com sucesso!",
        header: "Sucesso",
        icon: "pi pi-check",
        acceptLabel: "Ok",
        accept: () => navigate("/historico"),
      });
    } catch (err) {
      console.error("Erro ao fechar comanda:", err);

      confirmDialog({
        message: "Erro ao fechar comanda. Tente novamente!",
        header: "Erro",
        icon: "pi pi-times-circle",
        acceptLabel: "Ok",
        rejectVisible: false,
      });
    }
  };
  

  const produtosFiltrados = produtos
    .filter(
      (p) => !categoriaSelecionada || p.categoria === categoriaSelecionada
    )
    .filter((p) =>
      (p.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

  const produtosPaginados = produtosFiltrados.slice(
    currentPage * produtosPorPagina,
    (currentPage + 1) * produtosPorPagina
  );

  const totalComanda = comandaItens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  if (loading) {
    return (
      <p className="text-center text-gray-500 text-lg py-8">
        Carregando produtos...
      </p>
    );
  }

  return (
    <>
      <motion.div className="p-6 md:p-10 max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Botão Voltar */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate("/iniciar-venda")}
            className="bg-neutral-700 hover:bg-neutral-800 text-white px-6 py-2 rounded-lg transition"
          >
            ← Voltar para mesas
          </button>
        </div>

        {/* Cabeçalho */}
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Comanda da Mesa {mesaId}
        </h1>

        {/* Input de Busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            className={`px-4 py-2 rounded-full border transition 
          ${
            !categoriaSelecionada
              ? "bg-blue-600 text-white shadow"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
            onClick={() => setCategoriaSelecionada(null)}
          >
            Todas
          </button>
          {categorias.map((cat, idx) => (
            <button
              key={`${cat}-${idx}`}
              className={`px-4 py-2 rounded-full border transition
            ${
              categoriaSelecionada === cat
                ? "bg-blue-600 text-white shadow"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
              onClick={() => setCategoriaSelecionada(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtosPaginados.map((produto) => (
            <motion.div
              key={produto.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-300 ease-in-out"
            >
              <div className="flex flex-col items-center text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {produto.nome}
                </h3>
                <p className="mt-2 text-gray-500 text-base">
                  R$ {produto.preco.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => adicionarProduto(produto)}
                className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg shadow transition-all duration-300"
              >
                Adicionar
              </button>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Paginator
            first={currentPage * produtosPorPagina}
            rows={produtosPorPagina}
            totalRecords={produtosFiltrados.length}
            onPageChange={(e) => setCurrentPage(e.page)}
          />
        </div>

        {/* Itens da Comanda */}
        <div className="mt-12 bg-gray-50 p-8 rounded-lg shadow-inner">
          <h2 className="font-semibold text-xl mb-6 text-gray-700 border-b pb-2">
            Itens da Comanda
          </h2>

          {comandaItens.length === 0 ? (
            <p className="text-gray-400 text-center">
              Nenhum item adicionado na comanda.
            </p>
          ) : (
            <div className="divide-y">
              {comandaItens.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between py-4"
                >
                  <div className="flex-1 min-w-[200px] text-gray-700 font-medium">
                    {item.nome}{" "}
                    <span className="text-gray-500">x {item.quantidade}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementarQuantidade(item)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-5xl text-red-400 hover:bg-gray-100 transition font-semibold"
                    >
                      -
                    </button>
                    <button
                      onClick={() => incrementarQuantidade(item)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-5xl text-green-400 hover:bg-gray-100 transition font-semibold"
                    >
                      +
                    </button>
                  </div>

                  <div className="min-w-[80px] text-right font-semibold text-gray-800">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <SelecionarClientes
              onSelectCliente={(cliente) => setClienteSelecionado(cliente)}
            />
            <PagamentoOptions
              onSelect={(pagamento) => setPagamentoSelecionado(pagamento)}
            />
          </div>
        </div>

        {/* Fechar Comanda */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Total:{" "}
            <span className="text-blue-600">R$ {totalComanda.toFixed(2)}</span>
          </h3>

          <button
            onClick={handleFecharComanda}
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-lg transition font-semibold uppercase shadow-md"
          >
            Fechar Comanda
          </button>
        </div>
      </motion.div>

      <ConfirmDialog />
    </>
  );
};

export default ComandaAberta;
