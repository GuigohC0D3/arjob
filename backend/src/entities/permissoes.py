from ..connection.config import connect_db

def atualizar_permissoes_usuario(usuario_id, permissoes_lista):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Debug: Verificar permissões recebidas
            print(f"Recebido para o usuário {usuario_id}: {permissoes_lista}")

            # Verificar se a lista de permissões contém valores válidos
            if not permissoes_lista or not all(p is not None for p in permissoes_lista):
                return {"error": "A lista de permissões contém valores inválidos."}, 400

            # Converter nomes de permissões para IDs
            permissoes_ids = []
            for permissao in permissoes_lista:
                if isinstance(permissao, str):  # Se for nome da permissão
                    cur.execute("""
                        SELECT id FROM permissoes WHERE nome = %s
                    """, (permissao,))
                    result = cur.fetchone()
                    if result:
                        permissoes_ids.append(result[0])
                elif isinstance(permissao, int):  # Se já for ID
                    permissoes_ids.append(permissao)

            # Debug: Verificar permissões processadas
            print(f"Permissões processadas para o usuário {usuario_id}: {permissoes_ids}")

            # Verificar se a lista resultante está vazia
            if not permissoes_ids:
                return {"error": "Nenhuma permissão válida encontrada."}, 400

            # Remover permissões existentes
            cur.execute("DELETE FROM permissoes_usuario WHERE usuario_id = %s", (usuario_id,))
            print(f"Permissões antigas removidas para o usuário {usuario_id}")

            # Inserir as novas permissões
            for permissao_id in permissoes_ids:
                cur.execute("""
                    INSERT INTO permissoes_usuario (usuario_id, permissao_id)
                    VALUES (%s, %s)
                """, (usuario_id, permissao_id))
                print(f"Permissão {permissao_id} inserida para o usuário {usuario_id}")

            conn.commit()
            cur.close()
            conn.close()
            return {"message": "Permissões atualizadas com sucesso"}
        except Exception as e:
            conn.rollback()
            print(f"Erro ao atualizar permissões: {e}")
            return {"error": "Erro ao atualizar permissões"}, 500
    else:
        print("Erro ao conectar ao banco de dados")
        return {"error": "Erro ao conectar ao banco de dados"}, 500

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