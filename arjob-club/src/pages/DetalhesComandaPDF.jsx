import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import PropTypes from "prop-types";

// (Opcional) Fonte monoespaçada para simular cupom
Font.register({
  family: "Courier",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/courierprime/v1/u-480qWljRw-PdeL2uhquylEeQ5JZ-Y.woff2",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: "Courier",
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  divider: {
    borderBottom: "1 solid #000",
    marginVertical: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bold: {
    fontWeight: "bold",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1 solid #000",
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: "column",
    marginBottom: 5,
  },
  itemMain: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemObs: {
    fontSize: 8,
    color: "#333",
    marginTop: 2,
    marginLeft: 10,
  },
  footer: {
    marginTop: 10,
    textAlign: "center",
  },
});

const DetalhesComandaPDF = ({ comanda }) => {
  // Pegando dados que você já tem na comanda
  const {
    mesa_id = "N/A",
    cliente_nome = "Cliente não informado",
    cliente_cpf = "CPF não informado",
    atendente = "Atendente não informado",
    data_fechamento,
    total = 0,
    pagamento = "Forma de pagamento não informada",
    itens = [],
  } = comanda;

  const dataFechamentoFormatada = data_fechamento
    ? new Date(data_fechamento).toLocaleString()
    : "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho da loja */}
        <View style={styles.header}>
          <Text style={styles.bold}>PIMENTA VERDE ALIMENTOS LTDA</Text>
          <Text>RUA AUGUSTA, 1835 - CERVEJARIA CESAR</Text>
          <Text>CNPJ: 00.000.000/0001-00 IE: 000000000000</Text>
          <Text>SÃO PAULO - SP</Text>
        </View>

        <View style={styles.divider} />

        {/* Info da comanda */}
        <Text>CUPOM FISCAL</Text>
        <View style={styles.divider} />

        <Text>Data: {dataFechamentoFormatada}</Text>
        <Text>Mesa: {mesa_id}</Text>
        <Text>Cliente: {cliente_nome}</Text>
        <Text>CPF: {cliente_cpf}</Text>
        <Text>Garçom: {atendente}</Text>

        <View style={styles.divider} />

        {/* Itens */}
        <View style={styles.itemHeader}>
          <Text>ITEM</Text>
          <Text>QTD x VL UNIT</Text>
        </View>

        {itens.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            {/* Produto principal */}
            <View style={styles.itemMain}>
              <Text>{item.nome}</Text>
              <Text>
                {item.quantidade} x {parseFloat(item.preco).toFixed(2)}
              </Text>
            </View>

            {/* Observação do produto, se tiver */}
            {item.observacao && item.observacao.trim() !== "" && (
              <Text style={styles.itemObs}>Obs: {item.observacao}</Text>
            )}
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totais e pagamento */}
        <Text style={styles.bold}>
          TOTAL: R$ {parseFloat(total).toFixed(2)}
        </Text>
        <Text>PAGAMENTO: {pagamento}</Text>
        <Text>IMPOSTOS APROXIMADOS: R$ 5,69</Text>

        <View style={styles.divider} />

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>OBRIGADO PELA PREFERÊNCIA!</Text>
          <Text>05/12/2024 19:28:57</Text>
        </View>
      </Page>
    </Document>
  );
};

DetalhesComandaPDF.propTypes = {
  comanda: PropTypes.shape({
    mesa_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cliente_nome: PropTypes.string,
    cliente_cpf: PropTypes.string,
    atendente: PropTypes.string,
    data_fechamento: PropTypes.string,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pagamento: PropTypes.string,
    itens: PropTypes.arrayOf(
      PropTypes.shape({
        nome: PropTypes.string.isRequired,
        quantidade: PropTypes.number.isRequired,
        preco: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        observacao: PropTypes.string
      })
    )
  }).isRequired
};

export default DetalhesComandaPDF;
