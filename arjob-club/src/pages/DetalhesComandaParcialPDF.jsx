import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import PropTypes from "prop-types";

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
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  footer: {
    marginTop: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
});

const DetalhesComandaParcialPDF = ({ comanda }) => {
  const {
    mesa = "N/A",
    cliente = "Cliente não informado",
    atendente = "Atendente não informado",
    itens: rawItens = [],
    total = 0,
  } = comanda;

  const itens = Array.isArray(rawItens) ? rawItens : Object.values(rawItens || {});

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={{ fontWeight: "bold" }}>COMANDA PARCIAL</Text>
          <Text>Mesa: {mesa}</Text>
          <Text>Cliente: {cliente}</Text>
          <Text>Atendente: {atendente}</Text>
        </View>

        <View style={styles.divider} />

        <Text>Itens:</Text>

        {itens.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text>{item.nome}</Text>
            <Text>
              {item.quantidade} x R$ {parseFloat(item.preco).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text>Total Parcial: R$ {parseFloat(total).toFixed(2)}</Text>

        <View style={styles.footer}>
          <Text>Este não é um comprovante fiscal.</Text>
          <Text>Comanda parcial emitida para conferência.</Text>
        </View>
      </Page>
    </Document>
  );
};

DetalhesComandaParcialPDF.propTypes = {
  comanda: PropTypes.shape({
    mesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cliente: PropTypes.string,
    atendente: PropTypes.string,
    itens: PropTypes.arrayOf(
      PropTypes.shape({
        nome: PropTypes.string.isRequired,
        quantidade: PropTypes.number.isRequired,
        preco: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      })
    ),
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default DetalhesComandaParcialPDF;
