import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import PropTypes from "prop-types";

// Estilos para o PDF
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  heading: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  item: { marginBottom: 5 },
});

const DetalhesComandaPDF = ({ comanda }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>Detalhes da Comanda</Text>
        <Text>CPF: {comanda.cpf}</Text>
        <Text>Filial: {comanda.filial}</Text>
        <Text>Convênio: {comanda.convenio}</Text>
        <Text>Status: {comanda.status}</Text>
        <Text>Colaborador: {comanda.colaborador}</Text>
        <Text>
          Conta Dividida: {comanda.contaDividida ? "Sim" : "Não"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Itens Consumidos</Text>
        {comanda.consumido.map((item, index) => (
          <Text key={index} style={styles.item}>
            {item.quantidade}x {item.item} - R$ {item.valor.toFixed(2)}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
);

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
