from ..connection.config import connect_db

def listar_produtos():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nome, preco, categoria FROM produtos")
            produtos = cur.fetchall()
            cur.close()
            conn.close()
            return [
                {"id": prod[0], "nome": prod[1], "preco": prod[2], "categoria": prod[3]}
                for prod in produtos
            ]
        except Exception as e:
            print(f"Erro ao listar produtos: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None
