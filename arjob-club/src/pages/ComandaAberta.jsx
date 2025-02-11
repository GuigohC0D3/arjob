import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ComandaProcesso from "../components/ComandaProcesso";
import "./IniciarVenda.css";

const ComandaAberta = () => {
  const { numero } = useParams(); // Número da comanda pela URL
  const [comandaDetalhes, setComandaDetalhes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mesaAtual, setMesaAtual] = useState(null);
  const [clienteAtual, setClienteAtual] = useState(null);

  useEffect(() => {
    const fetchComandaDetalhes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://10.11.1.67:5000/comandas/numero/${numero}`);
        if (response.ok) {
          const data = await response.json();

          // 🔥 Se for uma mesa diferente, carregamos os dados corretos
          if (mesaAtual !== data.mesa_id) {
            setComandaDetalhes(data);
            setMesaAtual(data.mesa_id);
            setClienteAtual(data.cliente); // ✅ Salva o cliente correto para cada mesa
          }
        } else {
          console.error("Erro ao buscar detalhes da comanda.");
          setComandaDetalhes(null);
          setClienteAtual(null);
        }
      } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComandaDetalhes();
  }, [numero, mesaAtual]); // 🔥 Atualiza sempre que mudar de mesa

  return (
    <div className="comanda-aberta">
      {loading ? (
        <p>Carregando...</p>
      ) : comandaDetalhes ? (
        <ComandaProcesso comandaDetalhes={comandaDetalhes} cliente={clienteAtual} />
      ) : (
        <p>Comanda não encontrada.</p>
      )}
    </div>
  );
};

export default ComandaAberta;
