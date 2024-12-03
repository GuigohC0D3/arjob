import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComanda } from "../Hooks/UseComanda"; // Importando o hook para o contexto
import "./IniciarVenda.css";

const IniciarVenda = () => {
  const { adicionarComanda } = useComanda(); // Acessando a função para adicionar uma comanda
  const [cliente, setCliente] = useState({ nome: "Cleiton", mesa: "5" });
  const [produtos, setProdutos] = useState([
    { nome: "Produto 1", preco: 15.0, quantidade: 1 },
    { nome: "Produto 2", preco: 20.0, quantidade: 2 },
  ]);
  const [couvert, setCouvert] = useState(10.0);
  const [servico, setServico] = useState(10.0); // 10%
  const [status, setStatus] = useState("Aberta"); // Status inicial da comanda
  const navigate = useNavigate(); // Usando useNavigate para navegação

  // Função para adicionar quantidade de produto
  const adicionarProduto = (index) => {
    const novosProdutos = [...produtos];
    novosProdutos[index].quantidade += 1;
    setProdutos(novosProdutos); // Atualizando o estado
  };

  // Função para remover um produto
  const removerProduto = (index) => {
    const novosProdutos = [...produtos];
    if (novosProdutos[index].quantidade > 1) {
      novosProdutos[index].quantidade -= 1;
    }
    setProdutos(novosProdutos); // Atualizando o estado
  };

  // Função para atualizar o valor do couvert
  const atualizarCouvert = (valor) => {
    setCouvert(valor); // Atualizando o estado
  };

  // Função para atualizar o serviço (10%)
  const atualizarServico = (valor) => {
    setServico(valor); // Atualizando o estado
  };

  // Função para alterar o nome do cliente
  const alterarNomeCliente = (novoNome) => {
    setCliente({ ...cliente, nome: novoNome });
  };

  // Função para alterar a mesa do cliente
  const alterarMesaCliente = (novaMesa) => {
    setCliente({ ...cliente, mesa: novaMesa });
  };

  // Função para finalizar a comanda e salvar
  const finalizarComanda = () => {
    const comanda = {
      cliente,
      produtos,
      couvert,
      servico,
      total: calcularTotal(),
      status: "Fechada", // Mudando o status para "Fechada" quando a comanda é finalizada
      data: new Date().toLocaleString(),
    };

    // Adicionando a comanda ao contexto global
    adicionarComanda(comanda);

    // Atualizando o status da comanda para "Fechada"
    setStatus("Fechada");

    // Redirecionando para a página de listagem
    navigate("/comandas"); // Usando navigate para redirecionar
  };

  // Função para alterar o status manualmente (exemplo: "Fechada", "Aberta", "Cancelada", etc.)
  const alterarStatus = (novoStatus) => {
    setStatus(novoStatus);
  };

  // Calculando o total da comanda
  const calcularTotal = () => {
    const totalProdutos = produtos.reduce(
      (total, produto) => total + produto.preco * produto.quantidade,
      0
    );
    const totalServico = (totalProdutos * servico) / 100;
    return totalProdutos + totalServico + couvert;
  };

  return (
    <div className="iniciar-venda-container">
      <header className="venda-header">
        <h1>Iniciar Venda</h1>
        <p>Dados do Cliente e Produtos</p>
      </header>

      <main className="venda-main">
        <h2>
          Cliente:{" "}
          <input
            type="text"
            value={cliente.nome}
            onChange={(e) => alterarNomeCliente(e.target.value)}
            className="input-cliente"
          />
        </h2>
        <p>
          Mesa:{" "}
          <input
            type="text"
            value={cliente.mesa}
            onChange={(e) => alterarMesaCliente(e.target.value)}
            className="input-mesa"
          />
        </p>

        <div className="produtos-lista">
          <h3>Produtos Consumidos</h3>
          <ul>
            {produtos.map((produto, index) => (
              <li key={index}>
                {produto.nome} - R${produto.preco} x {produto.quantidade}
                <button onClick={() => adicionarProduto(index)}>+</button>
                <button onClick={() => removerProduto(index)}>-</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="detalhes-comanda">
          <p>Couvert: R${couvert}</p>
          <p>Serviço (10%): R${(calcularTotal() - couvert).toFixed(2)}</p>
          <p>Total: R${calcularTotal().toFixed(2)}</p>

          <div>
            <label>
              Alterar Couvert:{" "}
              <input
                type="number"
                value={couvert}
                onChange={(e) => atualizarCouvert(parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className="input-couvert"
              />
            </label>
          </div>

          <div>
            <label>
              Alterar Serviço (%):{" "}
              <input
                type="number"
                value={servico}
                onChange={(e) => atualizarServico(parseFloat(e.target.value))}
                min="0"
                max="100"
                className="input-servico"
              />
            </label>
          </div>

          {/* Alteração do Status da Comanda */}
          <div className="status-comanda">
            <label>Status da Comanda:</label>
            <select
              value={status}
              onChange={(e) => alterarStatus(e.target.value)}
              className="input-status"
            >
              <option value="Aberta">Aberta</option>
              <option value="Fechada">Fechada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Em Andamento">Em Andamento</option>
            </select>
          </div>
        </div>

        <div className="opcoes-comanda">
          <button onClick={finalizarComanda} className="btn finalizar">
            Finalizar Comanda
          </button>
        </div>
      </main>

      <footer className="venda-footer">
        <button onClick={() => navigate("/comandas")} className="btn voltar">
          Voltar
        </button>
      </footer>
    </div>
  );
};

export default IniciarVenda;
