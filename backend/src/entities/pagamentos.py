from ..connection.config import connect_db

def listar_tipos_pagamento():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, nome, descricao
                FROM tipos_pagamento
                WHERE ativo = TRUE
            """)
            tipos = cur.fetchall()

            return [
                {"id": tipo[0], "nome": tipo[1], "descricao": tipo[2]}
                for tipo in tipos
            ], 200
        except Exception as e:
            print(f"Erro ao listar tipos de pagamento: {e}")
            return {"error": "Erro ao buscar tipos de pagamento"}, 500
        finally:
            cur.close()
            conn.close()
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500
