import { useState, useEffect } from "react";

const GerenciarProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]); // 🔥 Adicionado estado para categorias
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estoque, setEstoque] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const produtosPorPagina = 5;

  useEffect(() => {
    fetchProdutos();
    fetchCategorias(); // 🔥 Busca categorias disponíveis no banco
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch("http://localhost:5000/produtos");
      let data = await response.json();
      console.log("Produtos recebidos do backend:", data); // Debug

      // 🔥 Corrige se a API retornar um array dentro de outro array
      if (Array.isArray(data) && Array.isArray(data[0])) {
        data = data[0];
      }

      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch("http://localhost:5000/categorias"); // 🔥 Endpoint para categorias
      let data = await response.json();
      console.log("Categorias recebidas do backend:", data); // Debug

      setCategorias(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const adicionarProduto = async () => {
    if (!nome || !preco || isNaN(parseFloat(preco)) || parseFloat(preco) <= 0) {
      alert("Por favor, insira um preço válido.");
      return;
    }

    const produto = { nome, preco: parseFloat(preco), categoria, estoque };

    try {
      const response = await fetch("http://localhost:5000/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto),
      });

      if (response.ok) {
        alert("Produto adicionado com sucesso!");
        fetchProdutos();
        setNome("");
        setPreco("");
        setCategoria("");
        setEstoque("");
        setCurrentPage(1);
      } else {
        alert("Erro ao adicionar produto.");
      }
    } catch (error) {
      alert("Erro ao adicionar produto.");
    }
  };

  // Cálculo para paginação
  const indexUltimoProduto = currentPage * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtos.slice(
    indexPrimeiroProduto,
    indexUltimoProduto
  );
  const totalPaginas = Math.ceil(produtos.length / produtosPorPagina);

  const irParaPagina = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const proximaPagina = () => {
    if (currentPage < totalPaginas) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const paginaAnterior = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          🛍️ Gerenciar Produtos
        </h1>

        {/* Formulário de Adição */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Preço"
            value={preco}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ""); // 🔥 Remove tudo que não for número
              if (value.lenght > 8) return;
              value = (parseFloat(value) / 100).toFixed(2); // 🔥 Divide por 100 para manter duas casas decimais
              if (!isNaN(value)) {
                setPreco(value);
              }
            }}
            className="border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300"
          />

          {/* 🔥 Dropdown para selecionar categoria */}
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.nome}>
                {cat.nome}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Estoque"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          onClick={adicionarProduto}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          ➕ Adicionar Produto
        </button>

        {/* Lista de Produtos */}
        <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4 text-center">
          📋 Lista de Produtos
        </h2>

        {produtos.length === 0 ? (
          <p className="text-gray-500 text-center">
            Nenhum produto cadastrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="text-left px-4 py-3 w-1/3">Nome</th>
                  <th className="text-center px-4 py-3 w-1/4">Preço</th>
                  <th className="text-center px-4 py-3 w-1/4">Categoria</th>
                  <th className="text-center px-4 py-3 w-1/4">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {produtosAtuais.map((produto, index) => (
                  <tr
                    key={produto.id || index}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="text-left px-4 py-3 whitespace-nowrap">
                      {produto.nome}
                    </td>
                    <td className="text-center px-4 py-3 font-semibold text-blue-600">
                      R$ {Number(produto.preco).toFixed(2)}
                    </td>
                    <td className="text-center px-4 py-3">
                      {produto.categoria}
                    </td>
                    <td className="text-center px-4 py-3">{produto.estoque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Controles de Paginação */}
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={paginaAnterior}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => irParaPagina(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={proximaPagina}
            disabled={currentPage === totalPaginas}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerenciarProdutos;
