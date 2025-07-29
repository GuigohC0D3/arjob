import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Paginator } from "primereact/paginator";
import { motion } from "framer-motion";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import PagamentoOptions from "../components/pagamento/PagamentoOptions";
import SelecionarClientes from "../components/selecionarClientes/SelecionarClientes";
import VerificarLimiteCliente from "./VerificarLimiteCliente";

const ComandaAberta = () => {
  // Usar 'comandaId' vindo da URL
  const { comandaId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

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
  const [usuarioLogado, setUsuarioLogado] = useState({ id: null, nome: "" });
  const toast = useRef(null);

  // Se o objeto atendente foi passado pelo state, use-o; senão, tente buscar detalhes da comanda
  useEffect(() => {
    if (state && state.atendente) {
      console.log("👤 Usuário via state:", state.atendente);
      setUsuarioLogado(state.atendente);
    } else if (comandaId) {
      // Caso seu endpoint de detalhes da comanda retorne os dados do atendente,
      // faça a requisição e ajuste conforme a resposta da API (ex: data.atendente ou data.usuario)
      const fetchComandaDetails = async () => {
        try {
          const res = await fetch(
            `http://10.11.1.80:5000/comandas/${comandaId}`
          );
          const data = await res.json();
          // Supondo que a API retorne 'atendente' com os dados completos
          if (data && data.atendente) {
            setUsuarioLogado(data.atendente);
          }
        } catch (err) {
          console.error("Erro ao buscar detalhes da comanda:", err);
        }
      };
      fetchComandaDetails();
    }
  }, [state, comandaId]);

  useEffect(() => {
    if (clienteSelecionado?.bloqueado) {
      confirmDialog({
        message: "Este cliente atingiu o limite do convênio.",
        header: "Convênio Bloqueado",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Entendi",
      });
    }
  }, [clienteSelecionado]);

  // Buscar produtos disponíveis
  const fetchProdutos = useCallback(async () => {
    try {
      const res = await fetch("http://10.11.1.80:5000/produtos");
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

  // Buscar os itens da comanda
  const fetchItensComanda = useCallback(async () => {
    if (!comandaId) return;
    try {
      const res = await fetch(
        `http://10.11.1.80:5000/comandas/${comandaId}/itens`
      );
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.warn("Itens de comanda inválidos:", data);
        return;
      }
      setComandaItens(data);
    } catch (err) {
      console.error("Erro ao buscar itens da comanda:", err);
    }
  }, [comandaId]);

  useEffect(() => {
    fetchProdutos();
    fetchItensComanda();
  }, [fetchProdutos, fetchItensComanda]);

  // Função para adicionar produto
  const adicionarProduto = async (produto) => {
    if (!comandaId) return;

    const payload = {
      produto_id: Number(produto.id),
      quantidade: 1,
      preco_unitario: Number(produto.preco),
    };

    try {
      const res = await fetch(
        `http://10.11.1.80:5000/comandas/${comandaId}/itens`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erro ao adicionar produto:", errorData);

        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: `Erro ao adicionar "${produto.nome}"`,
          life: 3000,
        });
        return;
      }

      toast.current?.show({
        severity: "success",
        summary: "Adicionado",
        detail: `"${produto.nome}" foi adicionado à comanda`,
        life: 2000,
      });

      await fetchItensComanda();
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
      toast.current?.show({
        severity: "error",
        summary: "Erro de rede",
        detail: "Não foi possível comunicar com o servidor.",
        life: 3000,
      });
    }
  };

  const incrementarQuantidade = async (item) => {
    if (!comandaId) return;
    try {
      await fetch(
        `http://10.11.1.80:5000/comandas/${comandaId}/itens/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantidade: item.quantidade + 1 }),
        }
      );
      await fetchItensComanda();
    } catch (err) {
      console.error("Erro ao incrementar quantidade:", err);
    }
  };

  const decrementarQuantidade = async (item) => {
    if (!comandaId) return;
    try {
      if (item.quantidade === 1) {
        await fetch(
          `http://10.11.1.80:5000/comandas/${comandaId}/itens/${item.id}`,
          {
            method: "DELETE",
          }
        );
      } else {
        await fetch(
          `http://10.11.1.80:5000/comandas/${comandaId}/itens/${item.id}`,
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

  const totalComanda = comandaItens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  // Lógica para fechamento da comanda
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

  const fecharComanda = async () => {
    const dadosParaEnviar = {
      cliente_id: clienteSelecionado.id,
      pagamento_id: pagamentoSelecionado.id,
      total: totalComanda,
      mesa_id: comandaId,
      itens: comandaItens,
      usuario_id: usuarioLogado.id,
    };

    try {
      await fetch(`http://10.11.1.80:5000/comandas/${comandaId}/fechar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
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

  const handleImprimirParcial = () => {
    const janela = window.open("", "_blank", "width=800,height=600");
    const clienteNome = clienteSelecionado?.nome || "Não selecionado";
    const clienteCPF = clienteSelecionado?.cpf || "---";
    const clienteConvenio = clienteSelecionado?.convenio || "---";
    const dataHora = new Date().toLocaleString("pt-BR");

    let conteudoHTML = `
    <html>
    <head>
      <title>Parcial da Comanda</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        h1, h3, p { margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #333; padding: 4px 6px; text-align: left; font-size: 11px; }
        .total { font-size: 1em; font-weight: bold; margin-top: 15px; }
        .assinatura { margin-top: 30px; }
        @media print {
          table, tr, td, th { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>Parcial da Comanda Nº ${comandaId}</h1>
      <h3>Cliente: ${clienteNome}</h3>
      <p>CPF: ${clienteCPF}<br/>
         Data e Hora: ${dataHora}<br/>
         Convênio: ${clienteConvenio}</p>

      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Unitário</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${comandaItens
            .map(
              (item) => `
            <tr>
              <td>${item.nome}</td>
              <td>${item.quantidade}</td>
              <td>R$ ${item.preco.toFixed(2)}</td>
              <td>R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="total">
        Total da Comanda: R$ ${totalComanda.toFixed(2)}
      </div>

      <div class="assinatura">
        _________________________________<br/>
        Assinatura do Cliente
      </div>
    </body>
    </html>
  `;

    janela.document.open();
    janela.document.write(conteudoHTML);
    janela.document.close();

    janela.onload = () => janela.print();
  };

  // Filtragem e paginação dos produtos
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

  if (loading) {
    return (
      <p className="text-center text-gray-500 text-lg py-8">
        Carregando produtos...
      </p>
    );
  }

  return (
    <>
      <Toast ref={toast} />

      <motion.div className="p-4 md:p-6 w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Voltar */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => navigate("/iniciar-venda")}
            className="bg-neutral-700 hover:bg-neutral-800 text-white px-5 py-2 rounded-lg transition"
          >
            ← Voltar para mesas
          </button>
        </div>

        {/* Cabeçalho */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-800">
          Comanda Nº {comandaId}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Atendente: {usuarioLogado.nome || "Não informado"}
        </p>

        {/* Busca */}
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
        <div className="flex flex-wrap justify-center gap-3 mb-6">
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

        {/* Produtos em 2 colunas */}
        <div className="flex gap-6">
          <div className="flex flex-col gap-4 w-1/2">
            {produtosPaginados
              .filter((_, idx) => idx % 2 === 0)
              .map((produto) => (
                <div
                  key={produto.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 break-words">
                      {produto.nome}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      R$ {produto.preco.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => adicionarProduto(produto)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
          </div>

          <div className="flex flex-col gap-4 w-1/2">
            {produtosPaginados
              .filter((_, idx) => idx % 2 !== 0)
              .map((produto) => (
                <div
                  key={produto.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 break-words">
                      {produto.nome}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      R$ {produto.preco.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => adicionarProduto(produto)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Paginator */}
        <div className="flex justify-center mt-8">
          <Paginator
            first={currentPage * produtosPorPagina}
            rows={produtosPorPagina}
            totalRecords={produtosFiltrados.length}
            onPageChange={(e) => setCurrentPage(e.page)}
          />
        </div>

        {/* Itens da comanda */}
        <div className="mt-12 bg-gray-50 p-6 rounded-lg shadow-inner">
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
              clienteSelecionado={clienteSelecionado}
            />

            {clienteSelecionado &&
              pagamentoSelecionado &&
              pagamentoSelecionado.nome === "Convênio" && (
                <VerificarLimiteCliente clienteId={clienteSelecionado.id} />
              )}
          </div>
        </div>

        {/* Total */}
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

          <button
            onClick={handleImprimirParcial}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg transition font-semibold uppercase shadow-md"
          >
            Imprimir Parcial
          </button>
        </div>
      </motion.div>

      <ConfirmDialog />
    </>
  );
};

export default ComandaAberta;
