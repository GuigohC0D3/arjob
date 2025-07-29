import { useState } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

/**
 * Componente para encapsular o processo de adicionar produto com observação
 * Props:
 * - onAdicionarProduto: function(produto, observacao) => void
 */
const AdicionarProdutoObservacao = ({ onAdicionarProduto }) => {
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [observacaoTemp, setObservacaoTemp] = useState("");

  const abrirDialog = (produto) => {
    setProdutoSelecionado(produto);
    setObservacaoTemp("");

    confirmDialog({
      message: (
        <div>
          <p className="mb-2">
            Alguma observação para <strong>{produto.nome}</strong>?
          </p>
          <input
            type="text"
            value={observacaoTemp}
            onChange={(e) => setObservacaoTemp(e.target.value)}
            placeholder="Ex: sem salada, sem cebola..."
            className="w-full p-2 border rounded"
          />
        </div>
      ),
      header: "Observação do Item",
      icon: "pi pi-pencil",
      acceptLabel: "Adicionar",
      rejectLabel: "Cancelar",
      accept: () => onAdicionarProduto(produto, observacaoTemp)
    });
  };

  return (
    <>
      {/* Importante manter o ConfirmDialog no DOM */}
      <ConfirmDialog />
      {/* expõe função via render prop / children */}
      {(typeof children === "function") && children(abrirDialog)}
    </>
  );
};

export default AdicionarProdutoObservacao;
