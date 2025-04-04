import { useState, useRef, useEffect } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
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
    matricula: "",
    limite: "",
  });

  const [departamentos, setDepartamentos] = useState([]);
  const toast = useRef(null);

  const formatBRL = (value) => {
    const onlyNumbers = value.replace(/\D/g, "");
    const numericValue = Number(onlyNumbers) / 100;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para carregar os departamentos do backend
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await fetch("http://10.11.1.67:5000/departamentos");
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

    // Formatação do CPF
    if (name === "cpf") {
      const cleanedValue = value.replace(/\D/g, ""); // Remove caracteres que não são números
      const formattedCPF = cleanedValue
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2")
        .slice(0, 14); // Limita a 14 caracteres
      setCliente((prevCliente) => ({
        ...prevCliente,
        cpf: formattedCPF,
      }));
      return;
    }

    // Restringir entrada para números no campo "Filial"
    if (name === "filial" && !/^\d*$/.test(value)) return;

    if (name === "matricula" && !/^\d*$/.test(value)) return;

    if (name === "limite") {
      const formatted = formatBRL(value);
      setCliente((prev) => ({ ...prev, limite: formatted }));
      return;
    }

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
      !cliente.departamento ||
      !cliente.matricula ||
      !cliente.limite
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
          matricula: "",
          limite: "",
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
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Cadastro de Cliente
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Nome", name: "nome", type: "text" },
              { label: "CPF", name: "cpf", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Telefone", name: "telefone", type: "text" },
              { label: "Filial", name: "filial", type: "text" },
              { label: "Matrícula", name: "matricula", type: "text" },
              { label: "Limite do Convênio", name: "limite", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">
                  {label}:
                </label>
                <input
                  type={type}
                  name={name}
                  value={cliente[name]}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700">
                Convênio:
              </label>
              <Dropdown
                id="convenio"
                value={cliente.convenio}
                options={[
                  { label: "Globo", value: "Globo" },
                  { label: "Nazária", value: "Nazária" },
                ]}
                onChange={handleConvenioChange}
                placeholder="Selecione um convênio"
                className="w-full border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">
              Departamento:
            </label>
            <Dropdown
              id="departamento"
              value={cliente.departamento}
              options={departamentos}
              onChange={handleDepartamentoChange}
              placeholder="Selecione um departamento"
              className="w-full border border-gray-300 rounded-lg"
              filter
              showClear
              filterBy="label"
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              label="Cadastrar Cliente"
              onClick={confirmSubmit}
              className="w-2/3 md:w-1/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md text-lg transition duration-200 ease-in-out transform hover:scale-105"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default CadastroCliente;
