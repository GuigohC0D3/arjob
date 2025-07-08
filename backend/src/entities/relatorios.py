from ..connection.config import connect_db

def listar_relatorios():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT
                    c.cpf,
                    c.nome,
                    TO_CHAR(co.data_fechamento, 'MM/YYYY') AS mes_fechamento,
                    MAX(co.data_fechamento) AS data_fechamento,
                    SUM(co.total) AS valor_total,
                    MAX(co.id) AS comanda_id
                FROM comandas co
                JOIN clientes c ON c.id = co.cliente_id
                WHERE co.data_fechamento IS NOT NULL
                GROUP BY c.cpf, c.nome, TO_CHAR(co.data_fechamento, 'MM/YYYY')
                ORDER BY MAX(co.data_fechamento) DESC
            """)
            rows = cur.fetchall()
            resultado = [
                {
                    "cpf": row[0],
                    "nome": row[1],
                    "mes_fechamento": row[2],
                    "data_fechamento": row[3].strftime("%Y-%m-%d"),
                    "valor_total": float(row[4]),
                    "comanda_id": row[5]
                }
                for row in rows
            ]
            return resultado
        except Exception as e:
            print(f"❌ Erro ao gerar relatório: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("❌ Erro ao conectar ao banco de dados")
        return None


def listar_consumos_cliente_mes(cpf, mes, ano):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            mes_int = int(mes)
            ano_int = int(ano)
            cur.execute("""
                SELECT
                    p.nome AS produto_nome,
                    p.preco AS preco_unitario,
                    i.quantidade,
                    (p.preco * i.quantidade) AS total_item,
                    co.data_fechamento,
                    co.id AS comanda_id
                FROM itens_comanda i
                JOIN produtos p ON p.id = i.produto_id
                JOIN comandas co ON co.id = i.comanda_id
                JOIN clientes c ON c.id = co.cliente_id
                WHERE REGEXP_REPLACE(c.cpf, '[^0-9]', '', 'g') = REGEXP_REPLACE(%s, '[^0-9]', '', 'g')
                  AND EXTRACT(MONTH FROM co.data_fechamento) = %s
                  AND EXTRACT(YEAR FROM co.data_fechamento) = %s
                  AND co.data_fechamento IS NOT NULL
                ORDER BY co.data_fechamento DESC
            """, (cpf, mes_int, ano_int))
            rows = cur.fetchall()
            resultado = [
                {
                    "produto_nome": row[0],
                    "preco_unitario": float(row[1]),
                    "quantidade": row[2],
                    "total_item": float(row[3]),
                    "data_fechamento": row[4].strftime("%Y-%m-%d %H:%M:%S") if row[4] else None,
                    "comanda_id": row[5]
                }
                for row in rows
            ]
            return resultado, 200
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"❌ Erro ao buscar consumo do cliente: {e}")
            return {"error": "Erro interno"}, 500
        finally:
            cur.close()
            conn.close()
    return {"error": "Erro na conexão"}, 500
