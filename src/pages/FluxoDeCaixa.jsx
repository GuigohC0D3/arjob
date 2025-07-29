import { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "./FluxoDeCaixa.css";

const FluxoDeCaixa = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [tipo, setTipo] = useState(null);
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(null);

  // Tipos de movimentação
  const tipos = [
    { label: "Entrada", value: "entrada" },
    { label: "Saída", value: "saida" },
  ];

  // Calcula o saldo automaticamente
  const calcularSaldo = () => {
    return movimentacoes.reduce((saldo, mov) => {
      return mov.tipo === "entrada"
        ? saldo + parseFloat(mov.valor)
        : saldo - parseFloat(mov.valor);
    }, 0);
  };

  // Adiciona uma movimentação
  const adicionarMovimentacao = () => {
    if (!tipo || !valor || !descricao || !data) {
      alert("Preencha todos os campos!");
      return;
    }

    const novaMovimentacao = {
      id: movimentacoes.length + 1,
      tipo,
      valor: parseFloat(valor).toFixed(2),
      descricao,
      data: data.toLocaleDateString("pt-BR"),
    };

    setMovimentacoes([...movimentacoes, novaMovimentacao]);
    limparFormulario();
  };

  // Limpa o formulário
  const limparFormulario = () => {
    setTipo(null);
    setValor("");
    setDescricao("");
    setData(null);
  };

  return (
    <div className="fluxo-de-caixa">
      <h2>Controle de Fluxo de Caixa</h2>

      {/* Formulário de registro */}
      <div className="formulario">
        <Dropdown
          value={tipo}
          options={tipos}
          onChange={(e) => setTipo(e.value)}
          placeholder="Selecione o tipo"
        />
        <InputText
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Valor"
          keyfilter="money"
        />
        <InputText
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição"
        />
        <Calendar
          value={data}
          onChange={(e) => setData(e.value)}
          dateFormat="dd/mm/yy"
          placeholder="Data"
        />
        <Button
          label="Adicionar Movimentação"
          onClick={adicionarMovimentacao}
          className="p-button-success"
        />
      </div>

      {/* Resumo */}
      <div className="resumo-saldo">
        <p>Saldo Atual: R$ {calcularSaldo().toFixed(2)}</p>
      </div>

      {/* Tabela de movimentações */}
      <div className="tabela-movimentacoes">
        <DataTable value={movimentacoes} emptyMessage="Nenhuma movimentação registrada.">
          <Column field="tipo" header="Tipo"></Column>
          <Column field="valor" header="Valor"></Column>
          <Column field="descricao" header="Descrição"></Column>
          <Column field="data" header="Data"></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default FluxoDeCaixa;
