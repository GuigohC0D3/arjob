import { useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa"; // 🔁 Ícone de atualizar

const GerenciarProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estoque, setEstoque] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroPesquisa, setFiltroPesquisa] = useState("");
  const produtosPorPagina = 5;

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch("http://10.11.1.67:5000/produtos");
      let data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch("http://10.11.1.67:5000/categorias");
      const data = await response.json();
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

    const produto = {
      nome,
      preco: parseFloat(preco),
      categoria,
      estoque: parseInt(estoque),
    };

    try {
      const response = await fetch("http://10.11.1.67:5000/produtos", {
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

  const importarPlanilha = async () => {
    if (!arquivo) return alert("Selecione um arquivo .xlsx para importar.");
    const formData = new FormData();
    formData.append("file", arquivo);

    try {
      const response = await fetch("http://10.11.1.67:5000/produtos/importar", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("Produtos importados com sucesso!");
        window.location.reload();
      } else {
        alert("Erro ao importar planilha.");
      }
    } catch (error) {
      alert("Erro ao enviar planilha.");
    }
  };

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(filtroPesquisa.toLowerCase())
  );
  const indexUltimoProduto = currentPage * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtosFiltrados.slice(
    indexPrimeiroProduto,
    indexUltimoProduto
  );
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Gerenciar Produtos
        </h1>

        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg"
          />
          <input
            type="text"
            placeholder="Preço"
            value={preco}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              value = (parseFloat(value) / 100).toFixed(2);
              if (!isNaN(value)) setPreco(value);
            }}
            className="border border-gray-300 p-3 rounded-lg"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg"
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
            className="border border-gray-300 p-3 rounded-lg"
          />
          <button
            onClick={adicionarProduto}
            className="bg-blue-600 text-white p-3 w-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Adicionar Produto
          </button>
        </div>

        {/* Importação */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setArquivo(e.target.files[0])}
            className="border p-2 rounded"
          />
          <button
            onClick={importarPlanilha}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Importar Planilha
          </button>
        </div>

        {/* Cabeçalho + atualizar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Lista de Produtos
          </h2>

          <button
            onClick={() => window.location.reload()}
            title="Atualizar página"
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            <FaSyncAlt className="text-gray-600" />
            Atualizar
          </button>
        </div>

        {/* Pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar produto..."
          value={filtroPesquisa}
          onChange={(e) => setFiltroPesquisa(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />

        {produtosFiltrados.length === 0 ? (
          <p className="text-gray-500 text-center">
            Nenhum produto encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white border rounded-lg shadow">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-center">Preço</th>
                  <th className="p-3 text-center">Categoria</th>
                  <th className="p-3 text-center">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {produtosAtuais.map((produto) => (
                  <tr key={produto.id} className="border-b hover:bg-gray-100">
                    <td className="p-3">{produto.nome}</td>
                    <td className="p-3 text-center">
                      R$ {Number(produto.preco).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">{produto.categoria}</td>
                    <td className="p-3 text-center">{produto.estoque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="bg-gray-300 px-4 py-1 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPaginas))}
            className="bg-gray-300 px-4 py-1 rounded disabled:opacity-50"
            disabled={currentPage === totalPaginas}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerenciarProdutos;
