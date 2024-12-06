import { useState, useRef } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import "primeicons/primeicons.css"; // Ícones
import "primeflex/primeflex.css"; // Classes utilitárias (flex, etc.)
import "primereact/resources/primereact.min.css"; // CSS base do PrimeReact
import "primereact/resources/themes/lara-light-blue/theme.css"; // Tema do PrimeReact
import "./CadastroCliente.css";

const CadastroCliente = () => {
  const [cliente, setCliente] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    filial: "",
    convenio: "",
    departamento: "",
  });

  const toast = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCliente({
      ...cliente,
      [name]: value,
    });
  };

  const accept = () => {
    toast.current.show({
      severity: "info",
      summary: "Confirmado",
      detail: "Cliente cadastrado com sucesso!",
      life: 3000,
    });
    console.log("Cliente cadastrado: ", cliente);
    // Limpar formulário
    setCliente({
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      filial: "",
      convenio: "",
      departamento: "",
    });
  };

  const reject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Rejeitado",
      detail: "Cadastro não realizado.",
      life: 3000,
    });
  };

  const confirmSubmit = () => {
    confirmDialog({
      group: "headless",
      message: "Tem certeza de que deseja cadastrar este cliente?",
      header: "Confirmação de Cadastro",
      icon: "pi pi-exclamation-triangle",
      accept: accept,
      reject: reject,
    });
  };

  return (
    <>
      <Toast ref={toast} />
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
                  hide(event);
                  accept();
                }}
                className="w-8rem"
              />
              <Button
                label="Cancelar"
                outlined
                onClick={(event) => {
                  hide(event);
                  reject();
                }}
                className="w-8rem"
              />
            </div>
          </div>
        )}
      />
      <div className="cadastro-container">
        <h2>Cadastro de Cliente</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group-row">
            <div className="input-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={cliente.nome}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="cpf">CPF:</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={cliente.cpf}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="input-group-row">
            <div className="input-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={cliente.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="telefone">Telefone:</label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={cliente.telefone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="input-group-row">
            <div className="input-group">
              <label htmlFor="filial">Filial:</label>
              <input
                type="text"
                id="filial"
                name="filial"
                value={cliente.filial}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="convenio">Convênio:</label>
              <input
                type="text"
                id="convenio"
                name="convenio"
                value={cliente.convenio}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="departamento">Departamento:</label>
              <input
                type="text"
                id="departamento"
                name="departamento"
                value={cliente.departamento}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <Button
            type="button"
            label="Cadastrar Cliente"
            onClick={confirmSubmit}
            className="p-button-success"
          />
        </form>
      </div>
    </>
  );
};

export default CadastroCliente;
