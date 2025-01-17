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

def listar_permissoes_usuario(usuario_id):
    try:
        conn = connect_db()
        if not conn:
            raise Exception("Erro ao conectar ao banco de dados")
        
        cur = conn.cursor()
        cur.execute("""
            SELECT p.nome
            FROM permissoes_usuario pu
            JOIN permissoes p ON pu.permissao_id = p.id
            WHERE pu.usuario_id = %s
        """, (usuario_id,))
        permissoes = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return permissoes
    except Exception as e:
        print(f"Erro ao buscar permissões do usuário {usuario_id}: {e}")
        raise
def adicionar_permissoes_usuario(usuario_id, permissoes):
    try:
        conn = connect_db()
        with conn.cursor() as cur:
            for permissao in permissoes:
                cur.execute("""
                    INSERT INTO permissoes_usuario (usuario_id, permissao_id)
                    SELECT %s, id FROM permissoes WHERE nome = %s
                    ON CONFLICT DO NOTHING
                """, (usuario_id, permissao))
        conn.commit()
        return {'usuario_id': usuario_id, 'permissoes': permissoes}
    except Exception as e:
        conn.rollback()
        print(f"Erro ao adicionar permissões ao usuário {usuario_id}: {e}")
        return None

def remover_permissoes_usuario(usuario_id, permissoes):
    try:
        conn = connect_db()
        with conn.cursor() as cur:
            for permissao in permissoes:
                cur.execute("""
                    DELETE FROM permissoes_usuario
                    WHERE usuario_id = %s AND permissao_id = (
                        SELECT id FROM permissoes WHERE nome = %s
                    )
                """, (usuario_id, permissao))
        conn.commit()
        return {'usuario_id': usuario_id, 'permissoes_removidas': permissoes}
    except Exception as e:
        conn.rollback()
        print(f"Erro ao remover permissões do usuário {usuario_id}: {e}")
        return None