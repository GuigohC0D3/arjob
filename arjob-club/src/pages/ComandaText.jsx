import { createContext, useState, useContext } from "react";
import PropTypes from 'prop-types';  // Importando PropTypes

// Criando o Contexto para as comandas
const ComandaContext = createContext();

// Componente provider para fornecer o estado para os filhos
export const ComandaProvider = ({ children }) => {
  const [comandas, setComandas] = useState([]);

  // Função para adicionar uma nova comanda
  const adicionarComanda = (novaComanda) => {
    setComandas((prevComandas) => [...prevComandas, novaComanda]);
  };

  return (
    <ComandaContext.Provider value={{ comandas, adicionarComanda }}>
      {children}
    </ComandaContext.Provider>
  );
};

// Validação de props usando PropTypes
ComandaProvider.propTypes = {
  children: PropTypes.node.isRequired,  // Definindo que children são obrigatórios
};

// Hook customizado para consumir o contexto
export const useComanda = () => {
  return useContext(ComandaContext);
};
