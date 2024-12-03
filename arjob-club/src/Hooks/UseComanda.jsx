// useComanda.js
import { useState } from "react";

const useComanda = () => {
  const [comandas, setComandas] = useState([]);

  const adicionarComanda = (comanda) => {
    setComandas((prevComandas) => [...prevComandas, comanda]);
  };

  return {
    comandas,
    adicionarComanda,
  };
};

export { useComanda };
