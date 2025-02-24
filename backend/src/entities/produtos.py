from ..connection.config import connect_db

def listar_produtos():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nome, preco, categoria, estoque FROM produtos")
            produtos = cur.fetchall()
            cur.close()
            conn.close()
            return [
                {"id": prod[0], "nome": prod[1], "preco": prod[2], "categoria": prod[3], "estoque": prod[4]}
                for prod in produtos
            ]
        except Exception as e:
            print(f"Erro ao listar produtos: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None
    
def adicionar_produto(nome, preco, categoria, estoque):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO produtos (nome, preco, categoria, estoque)
                VALUES (%s, %s, %s, %s) RETURNING id
            """, (nome, preco, categoria, estoque))

            produto_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return {"message": "Produto adicionado com sucesso!", "id": produto_id}, 201
        except Exception as e:
            conn.rollback()
            print(f"Erro ao adicionar produto: {e}")
            return {"error": "Erro ao adicionar produto"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500
    

def listar_produtos():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nome, preco, categoria, estoque FROM produtos")
            produtos = cur.fetchall()
            cur.close()
            conn.close()

            return [
                {"id": p[0], "nome": p[1], "preco": float(p[2]), "categoria": p[3], "estoque": p[4]}
                for p in produtos
            ], 200
        except Exception as e:
            print(f"Erro ao listar produtos: {e}")
            return {"error": "Erro ao listar produtos"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados!"}, 500