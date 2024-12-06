import { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./ImportarFinanceiros.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ImportarFinanceiros = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name); // Exibe o nome do arquivo
    }
  };

  const handleUpload = () => {
    if (!file) {
      setUploadStatus("Por favor, selecione um arquivo.");
      return;
    }

    parseFile(file); // Processa o arquivo ao clicar em "Importar"
    setUploadStatus("Arquivo importado com sucesso!");
  };

  const parseFile = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result
        .split("\n")
        .map((line) => line.split(",").map((item) => item.trim()));

      const headers = content[0];
      const rows = content
        .slice(1)
        .filter((row) => row.length === headers.length);

      setPreview([headers, ...rows]);
      generateDashboardData(rows);
    };
    reader.readAsText(uploadedFile);
  };

  const generateDashboardData = (rows) => {
    const receitas = [];
    const despesas = [];
    const categorias = {};

    rows.forEach(([data, tipo, valor, descricao]) => {
      const valorNum = parseFloat(valor);

      if (isNaN(valorNum)) {
        console.error(`Valor inválido encontrado: ${valor}`);
        return;
      }

      if (tipo.toLowerCase() === "receita") {
        receitas.push(valorNum);
      } else if (tipo.toLowerCase() === "despesa") {
        despesas.push(valorNum);
      }

      if (descricao) {
        categorias[descricao] = (categorias[descricao] || 0) + valorNum;
      }
    });

    const totalReceitas = receitas.reduce((acc, cur) => acc + cur, 0);
    const totalDespesas = despesas.reduce((acc, cur) => acc + cur, 0);
    const saldo = totalReceitas - totalDespesas;

    setDashboardData({
      totalReceitas,
      totalDespesas,
      saldo,
      categorias,
    });
  };

  return (
    <div className="importar-container">
      <h1>Importar Dados Financeiros</h1>
      <div className="upload-section">
        <label htmlFor="file-upload" className="file-label">
          Selecione um arquivo CSV
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleFileChange}
        />
        {fileName && <p className="file-name">Arquivo selecionado: {fileName}</p>}
        <button onClick={handleUpload} className="btn-import">
          Importar
        </button>
      </div>
      {uploadStatus && <p className="status-message">{uploadStatus}</p>}
      {preview.length > 1 && (
        <div className="preview-section">
          <h2>Pré-visualização</h2>
          <table className="preview-table">
            <thead>
              <tr>
                {preview[0].map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dashboardData && (
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-card">
              <h3>Total de Receitas</h3>
              <p>R$ {dashboardData.totalReceitas.toFixed(2)}</p>
            </div>
            <div className="dashboard-card">
              <h3>Total de Despesas</h3>
              <p>R$ {dashboardData.totalDespesas.toFixed(2)}</p>
            </div>
            <div className="dashboard-card">
              <h3>Saldo Final</h3>
              <p style={{ color: dashboardData.saldo >= 0 ? "green" : "red" }}>
                R$ {dashboardData.saldo.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="dashboard-content">
            <div className="chart">
              <h3>Receitas e Despesas</h3>
              <Bar
                key={JSON.stringify(dashboardData)}
                data={{
                  labels: ["Receitas", "Despesas"],
                  datasets: [
                    {
                      label: "Valores (R$)",
                      data: [
                        dashboardData.totalReceitas,
                        dashboardData.totalDespesas,
                      ],
                      backgroundColor: ["#28a745", "#dc3545"],
                    },
                  ],
                }}
              />
            </div>
            <div className="chart">
              <h3>Distribuição por Categoria</h3>
              <Doughnut
                key={JSON.stringify(dashboardData.categorias)}
                data={{
                  labels: Object.keys(dashboardData.categorias),
                  datasets: [
                    {
                      data: Object.values(dashboardData.categorias),
                      backgroundColor: [
                        "#007bff",
                        "#ffc107",
                        "#28a745",
                        "#dc3545",
                        "#FF6384",
                        "#9966FF",
                        "#4BC0C0",
                        "#FF9F40",
                        "#264653",
                        "#E76F51"
                      ],
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportarFinanceiros;
