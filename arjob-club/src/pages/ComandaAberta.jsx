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
        if (response.ok) {
          const produtos = await response.json();
          setProdutosCategoria(produtos);

          const categoriasUnicas = [...new Set(produtos.map((p) => p.categoria))];
          setCategorias(categoriasUnicas);
        } else {
          console.error("Erro ao buscar produtos.");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [mesaId]);

  // 🔥 Filtrando produtos por categoria e nome completo
  const produtosFiltrados = produtosCategoria
    .filter((produto) => categoriaSelecionada ? produto.categoria === categoriaSelecionada : true)
    .filter((produto) => searchTerm.trim() !== "" ? produto.nome.toLowerCase().includes(searchTerm.toLowerCase().trim()) : true);

  // 🔄 Paginação com PrimeReact
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const produtosPaginados = produtosFiltrados.slice(
    currentPage * produtosPorPagina,
    (currentPage + 1) * produtosPorPagina
  );

  const adicionarProduto = (produto) => {
    setComanda((prevComanda) => {
      const produtoExistente = prevComanda.find((p) => p.id === produto.id);
      return produtoExistente
        ? prevComanda.map((p) => p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p)
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

  const totalComanda = comanda.reduce((total, produto) => total + produto.preco * produto.quantidade, 0);

  if (loading) return <p>Carregando produtos...</p>;

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Comanda Aberta - Mesa {mesaId}</h1>

      {/* 🔍 Barra de Pesquisa */}
      <input
        type="text"
        placeholder="Buscar produto..."
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 🔥 Filtros de categoria */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          className={`p-2 rounded ${!categoriaSelecionada ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setCategoriaSelecionada(null)}
        >
          Todas
        </button>
        {categorias.map((categoria) => (
          <button
            key={categoria}
            className={`p-2 rounded ${categoria === categoriaSelecionada ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setCategoriaSelecionada(categoria)}
          >
            {categoria}
          </button>
        ))}
      </div>

      {/* 🔥 Lista de produtos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {produtosPaginados.map((produto) => (
          <motion.div
            key={produto.id}
            className="border p-4 shadow-md rounded-lg bg-white"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-semibold">{produto.nome}</h3>
            <p className="text-gray-600">R$ {Number(produto.preco || 0).toFixed(2)}</p>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded mt-2 hover:bg-green-600"
              onClick={() => adicionarProduto(produto)}
            >
              Adicionar
            </button>
          </motion.div>
        ))}
      </div>

      {/* 🔄 Paginação usando PrimeReact */}
      <div className="mt-6">
        <Paginator
          first={currentPage * produtosPorPagina}
          rows={produtosPorPagina}
          totalRecords={produtosFiltrados.length}
          onPageChange={(e) => setCurrentPage(e.page)}
          template="PrevPageLink PageLinks NextPageLink"
          className="p-paginator p-component text-blue-700 "
        />
      </div>

      {/* 🔥 Exibição da comanda */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold">Itens na Comanda</h2>
        {comanda.length === 0 ? (
          <p className="text-gray-500">Nenhum produto adicionado.</p>
        ) : (
          comanda.map((produto) => (
            <div key={produto.id} className="flex justify-between items-center p-2 border-b">
              <span>{produto.nome} x{produto.quantidade}</span>
              <div className="flex gap-2">
                <button className="bg-red-500 text-white px-2 rounded" onClick={() => decrementarQuantidade(produto.id)}>-</button>
                <button className="bg-blue-500 text-white px-2 rounded" onClick={() => incrementarQuantidade(produto.id)}>+</button>
              </div>
              <span>R$ {(produto.preco * produto.quantidade).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {/* 🔥 Total e botões */}
      <h3 className="text-right font-bold mt-4">Total: R$ {totalComanda.toFixed(2)}</h3>
      <div className="mt-6 flex gap-4">
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Fechar Comanda</button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700" onClick={() => navigate("/iniciar-venda")}>Voltar</button>
      </div>
    </motion.div>
  );
};

export default ComandaAberta;
