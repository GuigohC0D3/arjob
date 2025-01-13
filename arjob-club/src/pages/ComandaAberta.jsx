import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ComandaProcesso from "../components/ComandaProcesso";
import "./IniciarVenda.css";

const ComandaAberta = () => {
  const { numero } = useParams(); // Captura o número da comanda pela URL
  const [comandaDetalhes, setComandaDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComandaDetalhes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/comandas/${numero}`);
        if (response.ok) {
          const data = await response.json();
          setComandaDetalhes(data);
        } else {
          console.error("Erro ao buscar detalhes da comanda.");
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComandaDetalhes();
  }, [numero]);

  const handleAdicionarItem = () => {
    console.log("Abrir modal para adicionar item à comanda.");
  };

  return (
    <div className="comanda-aberta">
      {loading ? (
        <p>Carregando...</p>
      ) : comandaDetalhes ? (
        <ComandaProcesso
          comandaDetalhes={comandaDetalhes}
          onAdicionarItem={handleAdicionarItem}
        />
      ) : (
        <p>Comanda não encontrada.</p>
      )}
    </div>
  );
};

export default ComandaAberta;
