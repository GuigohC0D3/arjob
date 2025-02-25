import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paginator } from "primereact/paginator";
import { motion } from "framer-motion";

const ComandaAberta = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const [produtosCategoria, setProdutosCategoria] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [comanda, setComanda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const produtosPorPagina = 8;

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/produtos`);
        if (!response.ok) throw new Error("Erro ao buscar produtos.");

        let data = await response.json();
        console.log("Resposta bruta da API:", data);
        let produtos = Array.isArray(data) ? data : data.produtos || [];
        console.log("Produtos corrigidos:", produtos);

        // 🔥 Corrige caso produtos esteja aninhado dentro de um array extra
        if (Array.isArray(produtos) && Array.isArray(produtos[0])) {
          produtos = produtos[0]; // Extrai o array correto
        }

        // 🔥 Verifica se cada produto tem `id`, `nome`, `preco`
        produtos = produtos.map((p) => ({
          id: p.id || 0,
          nome: p.nome || "Produto Sem Nome",
          preco: p.preco || 0.0,
          categoria: p.categoria || "Sem Categoria",
          estoque: p.estoque || 0,
        }));

        console.log("Produtos após correção:", produtos); // Debug final
        setProdutosCategoria(produtos);

        // 🔥 Captura categorias únicas corretamente
        const categoriasUnicas = [
          ...new Set(produtos.map((p) => p.categoria).filter(Boolean)),
        ];
        setCategorias(categoriasUnicas);
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [mesaId]);

  const fecharComanda = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/fechar_mesa/${mesaId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comanda }),
        }
      );
      if (response.ok) {
        navigate("/historico");
      } else {
        console.error("Erro ao fechar comanda");
      }
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
    }
  };

  const produtosFiltrados = produtosCategoria
    .filter((produto) =>
      categoriaSelecionada ? produto.categoria === categoriaSelecionada : true
    )
    .filter((produto) =>
      searchTerm.trim() !== ""
        ? produto.nome.toLowerCase().includes(searchTerm.toLowerCase().trim())
        : true
    );

  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const produtosPaginados = produtosFiltrados.slice(
    currentPage * produtosPorPagina,
    (currentPage + 1) * produtosPorPagina
  );

  const adicionarProduto = (produto) => {
    setComanda((prevComanda) => {
      const produtoExistente = prevComanda.find((p) => p.id === produto.id);
      return produtoExistente
        ? prevComanda.map((p) =>
            p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p
          )
        : [...prevComanda, { ...produto, quantidade: 1 }];
    });
  };

  const incrementarQuantidade = (id) => {
    setComanda((prevComanda) =>
      prevComanda.map((p) =>
        p.id === id ? { ...p, quantidade: p.quantidade + 1 } : p
      )
    );
  };

  const decrementarQuantidade = (id) => {
    setComanda((prevComanda) =>
      prevComanda
        .map((p) => (p.id === id ? { ...p, quantidade: p.quantidade - 1 } : p))
        .filter((p) => p.quantidade > 0)
    );
  };

  const totalComanda = comanda.reduce(
    (total, produto) => total + produto.preco * produto.quantidade,
    0
  );

  if (loading)
    return <p className="text-center text-gray-600">Carregando produtos...</p>;

  return (
    <motion.div
      className="p-6 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Comanda Aberta - Mesa {mesaId}
      </h1>

      {/* 🔍 Barra de Pesquisa */}
      <input
        type="text"
        placeholder="Buscar produto..."
        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 🔥 Filtros de categoria */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          className={`p-2 rounded transition ${
            !categoriaSelecionada ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCategoriaSelecionada(null)}
        >
          Todas
        </button>
        {categorias.map((categoria, index) => (
          <button
            key={index} // 🔥 Agora cada item terá um índice único
            className={`p-2 rounded transition ${
              categoria === categoriaSelecionada
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setCategoriaSelecionada(categoria)}
          >
            {categoria}
          </button>
        ))}
      </div>

      {/* 🔥 Lista de produtos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {produtosPaginados.map((produto, index) => (
          <motion.div
            key={produto.id || index} // 🔥 Usa `index` se `id` estiver ausente
            className="border p-4 shadow-lg rounded-lg bg-white flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-semibold text-center">{produto.nome}</h3>
            <p className="text-gray-600">
              R$ {Number(produto.preco || 0).toFixed(2)}
            </p>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-3 hover:bg-green-600 transition"
              onClick={() => adicionarProduto(produto)}
            >
              Adicionar
            </button>
          </motion.div>
        ))}
      </div>

      {/* 🔄 Paginação */}
      <div className="mt-6 flex justify-center">
        <Paginator
          first={currentPage * produtosPorPagina}
          rows={produtosPorPagina}
          totalRecords={produtosFiltrados.length}
          onPageChange={(e) => setCurrentPage(e.page)}
          template="PrevPageLink PageLinks NextPageLink"
          className="p-paginator p-component text-blue-700"
        />
      </div>

      <div className="mt-6 bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-3">Itens na Comanda</h2>
        {comanda.length === 0 ? (
          <p className="text-gray-500">Nenhum produto adicionado.</p>
        ) : (
          <div className="w-full">
            {comanda.map((produto, index) => (
              <div
                key={produto.id || index}
                className="flex justify-between items-center p-3 border-b"
              >
                {/* Nome do Produto e Quantidade */}
                <span className="text-gray-800 font-medium w-1/3">
                  {produto.nome} x{produto.quantidade}
                </span>

                {/* Botões de Quantidade */}
                <div className="flex items-center gap-2">
                  <button
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
                    onClick={() => decrementarQuantidade(produto.id)}
                  >
                    -
                  </button>
                  <span className="text-gray-900 font-semibold">
                    {produto.quantidade}
                  </span>
                  <button
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition"
                    onClick={() => incrementarQuantidade(produto.id)}
                  >
                    +
                  </button>
                </div>

                {/* Preço Total do Produto */}
                <span className="text-gray-900 font-semibold w-1/3 text-right">
                  R$ {(produto.preco * produto.quantidade).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 Total e Botões */}
      <div className="mt-6 flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-2">
          Total: R$ {totalComanda.toFixed(2)}
        </h3>
        <div className="flex gap-4 mt-2">
          <button
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            onClick={fecharComanda}
          >
            Fechar Comanda
          </button>
          <button
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
            onClick={() => navigate("/iniciar-venda")}
          >
            Voltar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ComandaAberta;
