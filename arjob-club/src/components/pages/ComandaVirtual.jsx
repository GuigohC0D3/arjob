import { useState, useRef } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import './ComandaVirtual.css';
import 'primeicons/primeicons.css';

const ComandaVirtual = () => {
  const toast = useRef(null);
  const [comanda, setComanda] = useState([]);
  const [total, setTotal] = useState(0);
  const [cpfPesquisa, setCpfPesquisa] = useState('');
  const [colaborador, setColaborador] = useState(null);

  const produtos = [
    { id: 1, nome: 'Pizza Margherita', preco: 25.0 },
    { id: 2, nome: 'Hambúrguer', preco: 18.0 },
    { id: 3, nome: 'Cerveja', preco: 8.0 },
    { id: 4, nome: 'Refrigerante', preco: 5.0 },
    { id: 5, nome: 'Salada Caesar', preco: 15.0 },
  ];

  const colaboradores = [
    { nome: 'Guilherme Tapa Drop', cpf: '123.456.789-00', convenio: 'Globo', filial: '40' },
    { nome: 'Helves Brito', cpf: '987.654.321-99', convenio: 'ABC Corp', filial: '10' },
    { nome: 'Matheus Pereira', cpf: '456.789.123-11', convenio: 'TechCo', filial: '20' },
  ];

  const adicionarItem = (item) => {
    const novoItem = { ...item, quantidade: 1 };
    setComanda([...comanda, novoItem]);
    setTotal(total + item.preco);
  };

  const removerItem = (index) => {
    const itemRemovido = comanda[index];
    const novaComanda = [...comanda];
    novaComanda.splice(index, 1);
    setComanda(novaComanda);
    setTotal(total - itemRemovido.preco);
  };

  const atualizarQuantidade = (index, operacao) => {
    const novaComanda = [...comanda];
    const item = novaComanda[index];
    if (operacao === 'incrementar') {
      item.quantidade += 1;
      setTotal(total + item.preco);
    } else if (operacao === 'decrementar' && item.quantidade > 1) {
      item.quantidade -= 1;
      setTotal(total - item.preco);
    }
    setComanda(novaComanda);
  };
  
  const buscarColaborador = () => {
    const encontrado = colaboradores.find((c) => c.cpf === cpfPesquisa);
    if (encontrado) {
      setColaborador(encontrado);
    } else {
      toast.current.show({
        severity: 'warn',
        summary: 'Não encontrado',
        detail: 'Colaborador não encontrado',
        life: 3000,
      });
    }
  };

  const showTemplate = () => {
    confirmDialog({
      group: 'headless',
      message: 'Deseja realmente fechar a comanda?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        setComanda([]); // Zera a comanda
        setTotal(0); // Zera o total
        setColaborador(null); // Limpa as informações do colaborador
        toast.current.show({
          severity: 'success',
          summary: 'Comanda fechada com sucesso!',
          detail: 'A comanda foi fechada e zerada.',
          life: 3000,
        });
      },
      reject: () => {
        toast.current.show({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Ação cancelada',
          life: 3000,
        });
      },
    });
  };

  const editarCpf = () => {
    setCpfPesquisa('');
    setColaborador(null);
  };

  return (
    <div className="comanda-container">
      <Toast ref={toast} />

      {/* ConfirmDialog com template personalizado */}
      <ConfirmDialog
        group="headless"
        content={({ headerRef, contentRef, footerRef, hide, message }) => (
          <div className="flex flex-column align-items-center p-5 surface-overlay border-round">
            <div className="border-circle bg-primary inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8">
              <i className="pi pi-question text-5xl"></i>
            </div>
            <span className="font-bold text-2xl block mb-2 mt-4" ref={headerRef}>
              {message.header}
            </span>
            <p className="mb-0" ref={contentRef}>
              {message.message}
            </p>
            <div className="flex align-items-center gap-2 mt-4" ref={footerRef}>
              <Button
                label="Salvar"
                onClick={(event) => {
                  hide(event); // Fecha o dialog
                  toast.current.show({
                    severity: 'success',
                    summary: 'Comanda fechada',
                    detail: 'A comanda foi fechada com sucesso!',
                    life: 3000,
                  });
                  setComanda([]); // Limpa a comanda
                  setTotal(0); // Zera o total
                  setColaborador(null); // Limpa o colaborador
                }}
                className="w-8rem"
              />
              <Button
                label="Cancelar"
                outlined
                onClick={(event) => {
                  hide(event); // Fecha o dialog
                  toast.current.show({
                    severity: 'info',
                    summary: 'Cancelado',
                    detail: 'Ação cancelada',
                    life: 3000,
                  });
                }}
                className="w-8rem"
              />
            </div>
          </div>
        )}
      />

      <h2>Comanda Virtual</h2>

      <div className="cpf-colaborador">
        <h3>Buscar Colaborador</h3>
        <input
          type="text"
          value={cpfPesquisa}
          onChange={(e) => setCpfPesquisa(e.target.value)}
          placeholder="Digite o CPF"
        />
        <Button label="Buscar" onClick={buscarColaborador} className="p-button-primary" />

        {colaborador ? (
          <div className="informacoes-colaborador">
            <h4>Informações do Colaborador:</h4>
            <p><strong>Nome:</strong>{colaborador.nome}</p>
            <p><strong>CPF:</strong> {colaborador.cpf}</p>
            <p><strong>Convênio:</strong> {colaborador.convenio}</p>
            <p><strong>Filial:</strong> {colaborador.filial}</p>

            <div className="acoes-comanda">
              <Button label="Fechar Comanda" onClick={showTemplate} className="p-button-success" />
              <Button label="Editar CPF" onClick={editarCpf} className="p-button-warning" />
            </div>
          </div>
        ) : (
          <p>Nenhum colaborador selecionado</p>
        )}
      </div>

      <div className="produtos-container">
        <h3>Itens Disponíveis</h3>
        <ul className="produtos-list">
          {produtos.map((produto) => (
            <li key={produto.id} className="produto-item">
              <span>{produto.nome} - R${produto.preco.toFixed(2)}</span>
              <Button
                label="Adicionar"
                onClick={() => adicionarItem(produto)}
                className="p-button-outlined p-button-secondary"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="comanda">
        <h3>Itens na Comanda</h3>
        <ul className="comanda-list">
          {comanda.map((item, index) => (
            <li key={index} className="comanda-item">
              <span>{item.nome} - {item.quantidade} x R${item.preco.toFixed(2)}</span>
              <div className="comanda-actions">
                <Button
                  icon="pi pi-plus"
                  onClick={() => atualizarQuantidade(index, 'incrementar')}
                  className="p-button-rounded p-button-success"
                />
                <Button
                  icon="pi pi-minus"
                  onClick={() => atualizarQuantidade(index, 'decrementar')}
                  className="p-button-rounded p-button-warning"
                />
                <Button
                  icon="pi pi-trash"
                  onClick={() => removerItem(index)}
                  className="p-button-rounded p-button-danger"
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="total">
          <span>Total: R${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ComandaVirtual;
