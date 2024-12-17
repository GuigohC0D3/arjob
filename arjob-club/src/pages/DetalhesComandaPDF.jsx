import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import PropTypes from "prop-types";

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Courier", // Fonte monoespaçada
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  section: {
    borderBottom: "1px dashed #000", // Linha pontilhada como separador
    marginBottom: 10,
    paddingBottom: 5,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  item: {
    fontSize: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  total: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
    borderTop: "1px solid #000",
    paddingTop: 5,
  },
});

const DetalhesComandaPDF = ({ comanda }) => {
  // Calcular o total
  const total = comanda.consumido.reduce(
    (acc, item) => acc + item.valor * item.quantidade,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Título */}
        <Text style={styles.title}>*** COMANDA ***</Text>

        {/* Informações Principais */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.bold}>CPF:</Text>
            <Text>{comanda.cpf}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Filial:</Text>
            <Text>{comanda.filial}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Convênio:</Text>
            <Text>{comanda.convenio}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Colaborador:</Text>
            <Text>{comanda.colaborador}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Status:</Text>
            <Text>{comanda.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Conta Dividida:</Text>
            <Text>{comanda.contaDividida ? "Sim" : "Não"}</Text>
          </View>
        </View>

        {/* Itens Consumidos */}
        <View>
          <Text style={styles.bold}>Itens Consumidos:</Text>
          {comanda.consumido.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.item}>
                {item.quantidade}x {item.item}
              </Text>
              <Text style={styles.item}>
                R$ {(item.valor * item.quantidade).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
      </Page>
    </Document>
  );
};

// Validação de PropTypes
DetalhesComandaPDF.propTypes = {
  comanda: PropTypes.shape({
    cpf: PropTypes.string.isRequired,
    filial: PropTypes.string.isRequired,
    convenio: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    colaborador: PropTypes.string.isRequired,
    contaDividida: PropTypes.bool.isRequired,
    consumido: PropTypes.arrayOf(
      PropTypes.shape({
        item: PropTypes.string.isRequired,
        quantidade: PropTypes.number.isRequired,
        valor: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default DetalhesComandaPDF;
