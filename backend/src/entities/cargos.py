from ..connection.config import connect_db

def listar_cargos():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nome FROM cargos")
            cargos = cur.fetchall()
            cur.close()
            conn.close()
            return [{"id": cargo[0], "nome": cargo[1]} for cargo in cargos]
        except Exception as e:
            print(f"Erro ao listar cargos: {e}")
            return []
    else:
        print("Erro ao conectar ao banco de dados")
        return []

def associar_usuario_cargo(usuario_id, cargo_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO cargo_usuario (usuario_id, cargo_id, criado_em)
                VALUES (%s, %s, NOW())
            """, (usuario_id, cargo_id))
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            conn.rollback()
            print(f"Erro ao associar usuário a cargo: {e}")
    else:
        print("Erro ao conectar ao banco de dados")

def buscar_todos():
    conn = connect_db() 
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nome FROM cargos")
            resultados = cur.fetchall()
            cur.close()
            conn.close()
            
            return [{"id": row[0], "nome": row[1]} for row in resultados]
        except Exception as e:
            print(f"Erro ao buscar cargos: {e}")
            return []
    else:
        print("Erro ao conectar ao banco de dados")
        return []