from ..connection.config import connect_db

def listar_mesas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, numero, status FROM mesas")
            mesas = cur.fetchall()
            cur.close()
            conn.close()
            return [{"id": mesa[0], "numero": mesa[1], "status": mesa[2]} for mesa in mesas]
        except Exception as e:
            print(f"Erro ao listar mesas: {e}")
            return None
    return None

def criar_mesa(numero):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("INSERT INTO mesas (numero) VALUES (%s) RETURNING id", (numero,))
            mesa_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return mesa_id
        except Exception as e:
            print(f"Erro ao criar mesa: {e}")
            return None
    return None

def verificar_status_mesa(mesa_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT status FROM mesas WHERE id = %s", (mesa_id,))
            status = cur.fetchone()
            cur.close()
            conn.close()
            return status[0] if status else None
        except Exception as e:
            print(f"Erro ao verificar status da mesa: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None

def atualizar_status_mesa(mesa_id, novo_status):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                "UPDATE mesas SET status = %s WHERE id = %s", (novo_status, mesa_id)
            )
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Erro ao atualizar status da mesa: {e}")
    else:
        print("Erro ao conectar ao banco de dados")


def excluir_mesa(mesa_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM mesas WHERE id = %s", (mesa_id,))
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"Erro ao excluir mesa: {e}")
            return False
    return False
