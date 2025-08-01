import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaShoppingCart,
  FaBoxOpen,
  FaCashRegister,
} from "react-icons/fa";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const StatCard = ({ icon, title, value, percent, color, bgcolor }) => (
  <Card
    component={motion.div}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
    sx={{ display: "flex", alignItems: "center", p: 2 }}
  >
    <Avatar sx={{ bgcolor: bgcolor, mr: 2 }}>{icon}</Avatar>
    <Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h5">{value}</Typography>
      <Typography variant="body2" color={color}>
        {percent}
      </Typography>
    </Box>
  </Card>
);

const Dashboard = () => {
  const [data, setData] = useState({
    total_vendas_ano: 0,
    total_vendas_mes: 0,
    total_produtos_ano: 0,
    vendas_por_mes: {},
    consumo_por_categoria: {},
    clientes_por_convenio: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get("http://10.11.1.80:5000/dashboard")
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar dados do dashboard:", error);
          setLoading(false);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const meses_pt = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Função para decidir % e cor
  const getPercentInfo = (actual, average) => {
    if (average === 0) return { percent: "+0%", color: "gray" };
    const diff = ((actual - average) / average) * 100;
    let color = "gray";
    if (diff > 5) color = "green";
    else if (diff < -5) color = "red";
    else color = "orange";
    return { percent: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`, color };
  };

  // Médias calculadas
  const vendasMeses = Object.values(data.vendas_por_mes);
  const mediaVendasMes = vendasMeses.length
    ? vendasMeses.reduce((a, b) => a + b, 0) / vendasMeses.length
    : 0;

  const clientesTotal = Object.values(data.clientes_por_convenio).reduce(
    (a, b) => a + b,
    0
  );
  const mediaClientes = clientesTotal / (vendasMeses.length || 1);

  const produtosMedia = data.total_produtos_ano / 12;

  const lineData = {
    labels: meses_pt,
    datasets: [
      {
        label: "Vendas no Mês",
        data: meses_pt.map((m) => data.vendas_por_mes[m] || 0),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.3,
      },
    ],
  };

  const convenioData = {
    labels: Object.keys(data.clientes_por_convenio),
    datasets: [
      {
        label: "Clientes por Convênio",
        data: Object.values(data.clientes_por_convenio),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
      },
    ],
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress size={80} />
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: "center", padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
        gap={3}
      >
        <StatCard
          icon={<FaShoppingCart color="#fff" />}
          title="Total Vendas Ano"
          value={`R$ ${data.total_vendas_ano.toLocaleString()}`}
          {...getPercentInfo(data.total_vendas_ano, mediaVendasMes * 12)}
          bgcolor="#3f51b5"
        />

        <StatCard
          icon={<FaBoxOpen color="#fff" />}
          title="Produtos Consumidos"
          value={data.total_produtos_ano}
          {...getPercentInfo(data.total_produtos_ano, produtosMedia * 12)}
          bgcolor="#009688"
        />

        <StatCard
          icon={<FaCashRegister color="#fff" />}
          title="Total Vendas Mês"
          value={`R$ ${data.total_vendas_mes.toLocaleString()}`}
          {...getPercentInfo(data.total_vendas_mes, mediaVendasMes)}
          bgcolor="#4caf50"
        />

        <StatCard
          icon={<FaUsers color="#fff" />}
          title="Clientes por Convênio"
          value={clientesTotal}
          {...getPercentInfo(clientesTotal, mediaClientes * 12)}
          bgcolor="#f44336"
        />
      </Box>

      <Box
        mt={4}
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={3}
      >
        <Card component={motion.div} whileHover={{ scale: 1.02 }}>
          <CardContent>
            <Typography variant="h6">Quantidade por Convênio</Typography>
            <Bar
              data={convenioData}
              options={{
                animation: { duration: 1000, easing: "easeInOutQuart" },
              }}
            />
          </CardContent>
        </Card>

        <Card component={motion.div} whileHover={{ scale: 1.02 }}>
          <CardContent>
            <Typography variant="h6">Vendas por Mês</Typography>
            <Line
              data={lineData}
              options={{
                animation: { duration: 1000, easing: "easeInOutQuart" },
              }}
            />
          </CardContent>
        </Card>
      </Box>

      <Box mt={4}>
        <Card
          sx={{ borderRadius: 3, boxShadow: 3 }}
          component={motion.div}
          whileHover={{ scale: 1.01 }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <strong>Resumo</strong>
            </Typography>

            <Typography variant="body1" sx={{ mt: 2 }}>
              {(() => {
                const vendasMes = data.vendas_por_mes || {};
                const mesPico = Object.entries(vendasMes).reduce(
                  (a, b) => (a[1] > b[1] ? a : b),
                  ["Nenhum", 0]
                );
                const nomeMesPico = mesPico[0];
                const valorMesPico = mesPico[1];

                const convenios = data.clientes_por_convenio || {};
                const convenioTop = Object.entries(convenios).reduce(
                  (a, b) => (a[1] > b[1] ? a : b),
                  ["Nenhum", 0]
                );

                return (
                  <>
                    <strong>{nomeMesPico}</strong> foi o mês com maior vendas,
                    somando <strong>R$ {valorMesPico.toLocaleString()}</strong>.
                    <br />O convênio com mais clientes é{" "}
                    <strong>{convenioTop[0]}</strong>, com{" "}
                    <strong>{convenioTop[1]}</strong> clientes.
                    <br />
                    Foram consumidos <strong>
                      {data.total_produtos_ano}
                    </strong>{" "}
                    produtos no ano, totalizando{" "}
                    <strong>R$ {data.total_vendas_ano.toLocaleString()}</strong>{" "}
                    em vendas.
                  </>
                );
              })()}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
