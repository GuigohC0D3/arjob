from ..connection.config import connect_db

def obter_historico_completo(comanda_code):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Dados gerais da comanda
            cur.execute("""
                SELECT 
                    hc.id,
                    c.code,
                    cl.nome,
                    tp.nome,
                    u.nome,
                    hc.total,
                    hc.data_fechamento
                FROM historico_comandas hc
                INNER JOIN comandas c ON hc.comanda_id = c.id
                LEFT JOIN clientes cl ON hc.cliente_id = cl.id
                LEFT JOIN tipos_pagamento tp ON hc.pagamento_id = tp.id
                LEFT JOIN usuarios u ON hc.usuario_id = u.id
                WHERE c.code = %s
            """, (comanda_code,))

            historico = cur.fetchone()

            if not historico:
                return {"error": "Histórico não encontrado"}, 404

            historico_comanda_id = historico[0]

            # Itens consumidos
            cur.execute("""
                SELECT
                    p.nome,
                    ic.quantidade,
                    ic.preco_unitario,
                    (ic.quantidade * ic.preco_unitario) AS total_item
                FROM itens_comanda ic
                JOIN produtos p ON ic.produto_id = p.id
                WHERE ic.historico_comanda_id = %s
            """, (historico_comanda_id,))

            itens = cur.fetchall()

            cur.close()
            conn.close()

            # Retorno JSON
            return {
                "id": historico[0],
                "code": historico[1],
                "cliente": historico[2],
                "pagamento": historico[3],
                "atendente": historico[4],
                "total": float(historico[5]),
                "data_fechamento": historico[6].isoformat() if historico[6] else None,
                "itens": [
                    {
                        "produto": item[0],
                        "quantidade": item[1],
                        "preco_unitario": float(item[2]),
                        "total_item": float(item[3])
                    } for item in itens
                ]
            }, 200

        except Exception as e:
            print(f"Erro ao obter histórico completo: {e}")
            return {"error": "Erro ao obter histórico completo"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500
