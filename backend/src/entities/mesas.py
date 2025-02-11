from ..connection.config import connect_db


def listar_mesas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, numero, status FROM mesas")
            mesas = cur.fetchall()
            return [{"id": mesa[0], "numero": mesa[1], "status": mesa[2]} for mesa in mesas]
        except Exception as e:
            print(f"Erro ao listar mesas: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("Erro ao conectar ao banco de dados")
        return None


def criar_mesa(numero):
    if not isinstance(numero, int) or numero <= 0:
        print("Número inválido para a mesa")
        return None

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("INSERT INTO mesas (numero, status) VALUES (%s, 'disponivel') RETURNING id", (numero,))
            mesa_id = cur.fetchone()[0]
            conn.commit()
            return mesa_id
        except Exception as e:
            print(f"Erro ao criar mesa: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("Erro ao conectar ao banco de dados")
        return None


def verificar_status_mesa(mesa_id):
    if not isinstance(mesa_id, int) or mesa_id <= 0:
        print("ID inválido para a mesa")
        return None

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT status FROM mesas WHERE id = %s", (mesa_id,))
            status = cur.fetchone()
            return status[0] if status else None
        except Exception as e:
            print(f"Erro ao verificar status da mesa: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("Erro ao conectar ao banco de dados")
        return None


def atualizar_status_mesa(mesa_id, ocupada):
    if not isinstance(mesa_id, int) or mesa_id <= 0 or not isinstance(ocupada, bool):
        print("Dados inválidos para atualizar status da mesa")
        return False

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("UPDATE mesas SET status = %s WHERE id = %s", (ocupada, mesa_id))
            conn.commit()
            return True
        except Exception as e:
            print(f"Erro ao atualizar status da mesa: {e}")
            return False
        finally:
            cur.close()
            conn.close()
    else:
        print("Erro ao conectar ao banco de dados")
        return False



def excluir_mesa(mesa_id):
    if not isinstance(mesa_id, int) or mesa_id <= 0:
        print("ID inválido para a mesa")
        return False

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM mesas WHERE id = %s", (mesa_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Erro ao excluir mesa: {e}")
            return False
        finally:
            cur.close()
            conn.close()
    else:
        print("Erro ao conectar ao banco de dados")
        return False
