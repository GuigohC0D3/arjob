import { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import api from "../../apiConfig";

const Dashboard = () => {
  const [chartData, setChartData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setChartData(response.data.chartData);
        setRecentActivities(response.data.recentActivities);
      } catch (err) {
        setError("Erro ao carregar dados do dashboard. Tente novamente.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#495057",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
      y: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
    },
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="chart-container">
        <h3>Novos Usuários e Clientes (Últimos 6 meses)</h3>
        {chartData && (
          <Chart
            type="bar"
            data={chartData}
            options={chartOptions}
            style={{ width: "80%", margin: "0 auto" }}
          />
        )}
      </div>

      <div className="recent-activities">
        <h3>Atividades Recentes</h3>
        <DataTable value={recentActivities} paginator rows={5} responsiveLayout="scroll">
          <Column field="date" header="Data" sortable></Column>
          <Column field="user" header="Usuário" sortable></Column>
          <Column field="action" header="Ação" sortable></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default Dashboard;
