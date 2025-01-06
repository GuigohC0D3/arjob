import { useState } from "react";
import SearchBar from "../components/Searchbar";

const ProdutoPage = () => {
  const [produtos, setProdutos] = useState([]);

  const handleResults = (results) => {
    console.log("Resultados recebidos do SearchBar:", results);
    setProdutos(results);
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl text-white mb-4">Produtos</h1>

      {/* Passando a função handleResults como prop */}
      <SearchBar onResults={handleResults} />

      {/* Lista de Produtos */}
      <div className="mt-4">
        {produtos.length === 0 ? (
          <p className="text-gray-400">Nenhum produto encontrado.</p>
        ) : (
          <ul className="list-disc pl-6">
            {produtos.map((produto, index) => (
              <li key={index} className="text-white">
                {produto.nome} - R$ {(Number(produto.preco) || 0).toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProdutoPage;
