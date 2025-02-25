from ..connection.config import connect_db

def adicionar_produto(nome, preco, categoria_id, estoque):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO produtos (nome, preco, categoria_id, estoque)
                VALUES (%s, %s, %s, %s) RETURNING id
            """, (nome, preco, categoria_id, estoque))

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
            cur.execute("""
                SELECT p.id, p.nome, p.preco, c.nome AS categoria, p.estoque
                FROM produtos p
                LEFT JOIN categoria_produto c ON p.categoria_id = c.id
            """)
            produtos = cur.fetchall()
            cur.close()
            conn.close()

            return [
                {
                    "id": p[0], 
                    "nome": p[1], 
                    "preco": float(p[2]), 
                    "categoria": p[3],  # Agora retorna o nome da categoria
                    "estoque": p[4]
                }
                for p in produtos
            ], 200
        except Exception as e:
            print(f"Erro ao listar produtos: {e}")
            return {"error": "Erro ao listar produtos"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500    

def listar_categorias():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nome FROM categoria_produto")
            categorias = cur.fetchall()
            cur.close()
            conn.close()

            return [{"id": c[0], "nome": c[1]} for c in categorias], 200
        except Exception as e:
            print(f"Erro ao listar categorias: {e}")
            return {"error": "Erro ao listar categorias"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500
