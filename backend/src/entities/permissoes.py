from ..connection.config import connect_db

def atualizar_permissoes_usuario(usuario_id, permissoes_lista):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM permissoes_usuario WHERE usuario_id = %s", (usuario_id,))
            for permissao in permissoes_lista:
                cur.execute("""
                    INSERT INTO permissoes_usuario (usuario_id, permissao)
                    VALUES (%s, %s)
                """, (usuario_id, permissao))
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            conn.rollback()
            print(f"Erro ao atualizar permissões: {e}")
    else:
        print("Erro ao conectar ao banco de dados")
