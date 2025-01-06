from ..connection.config import connect_db

def buscar_produtos_db(query="", filtro=None):
    try:
        conn = connect_db()
        if conn:
            cur = conn.cursor()

            # Construção do SQL dinâmico para busca e filtro
            query_sql = """
                SELECT * FROM produtos
                WHERE LOWER(nome) LIKE LOWER(%s)
            """
            params = [f"%{query}%"]

            if filtro:
                query_sql += " AND categoria = %s"
                params.append(filtro)

            cur.execute(query_sql, params)
            produtos = cur.fetchall()

            cur.close()
            conn.close()
            return produtos
        else:
            raise Exception("Erro ao conectar ao banco de dados")
    except Exception as e:
        raise e
