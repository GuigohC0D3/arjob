import { useState, useRef, useEffect } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import InputMask from "react-input-mask"; // Biblioteca para máscaras de entrada
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
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

  const [departamentos, setDepartamentos] = useState([]);
  const toast = useRef(null);

  // Função para carregar os departamentos do backend
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/departamentos");
        if (response.ok) {
          const data = await response.json();
          setDepartamentos(
            data.map((dep) => ({ label: dep.nome, value: dep.id }))
          );
        } else {
          console.error("Erro ao carregar departamentos");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      }
    };
    fetchDepartamentos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restringir entrada para números no campo "Filial"
    if (name === "filial" && !/^\d*$/.test(value)) return;

    setCliente((prevCliente) => ({
      ...prevCliente,
      [name]: value,
    }));
  };

  const handleDepartamentoChange = (e) => {
    setCliente((prevCliente) => ({
      ...prevCliente,
      departamento: e.value,
    }));
  };

  const handleConvenioChange = (e) => {
    setCliente((prevCliente) => ({
      ...prevCliente,
      convenio: e.value,
    }));
  };

  const enviarCadastro = async () => {
    // Validação de campos obrigatórios
    if (
      !cliente.nome ||
      !cliente.cpf ||
      !cliente.email ||
      !cliente.telefone ||
      !cliente.filial ||
      !cliente.convenio ||
      !cliente.departamento
    ) {
      toast.current.show({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos antes de enviar!",
        life: 3000,
      });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
      });

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Cliente cadastrado com sucesso!",
          life: 3000,
        });

        setCliente({
          nome: "",
          cpf: "",
          email: "",
          telefone: "",
          filial: "",
          convenio: "",
          departamento: "",
        });
      } else {
        const errorData = await response.json();
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: errorData.message || "Erro ao cadastrar cliente.",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      toast.current.show({
        severity: "error",
        summary: "Erro",
        detail: "Não foi possível conectar ao servidor.",
        life: 3000,
      });
    }
  };

  const accept = () => {
    enviarCadastro();
  };

  const reject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Cancelado",
      detail: "Cadastro do cliente cancelado.",
      life: 3000,
    });
  };

  const confirmSubmit = () => {
    confirmDialog({
      message: "Tem certeza de que deseja cadastrar este cliente?",
      header: "Confirmação de Cadastro",
      icon: "pi pi-exclamation-triangle",
      accept,
      reject,
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
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
              <InputMask
                mask="999.999.999-99"
                id="cpf"
                name="cpf"
                value={cliente.cpf}
                onChange={handleInputChange}
                required
              />
            </div>
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
          </div>

          <div className="input-group-row">
            <div className="input-group">
              <label htmlFor="telefone">Telefone:</label>
              <InputMask
                mask="(99) 99999-9999"
                id="telefone"
                name="telefone"
                value={cliente.telefone}
                onChange={handleInputChange}
                required
              />
            </div>
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
              <Dropdown
                id="convenio"
                value={cliente.convenio}
                options={[
                  { label: "Globo", value: "Globo" },
                  { label: "Nazária", value: "Nazária" },
                ]}
                onChange={handleConvenioChange}
                placeholder="Selecione um convênio"
              />
            </div>
          </div>

          <div className="input-group-row">
            <div className="input-group">
              <label htmlFor="departamento">Departamento:</label>
              <Dropdown
                id="departamento"
                value={cliente.departamento}
                options={departamentos}
                onChange={handleDepartamentoChange}
                placeholder="Selecione um departamento"
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
