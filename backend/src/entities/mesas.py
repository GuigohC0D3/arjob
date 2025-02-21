from ..connection.config import connect_db

def listar_mesas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, numero, status FROM mesas")
            mesas = cur.fetchall()
            return [{"id": mesa[0], "numero": mesa[1], "status": bool(mesa[2])} for mesa in mesas]  # 🔥 Garante que `status` seja booleano
        except Exception as e:
            print(f"❌ Erro ao listar mesas: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("❌ Erro ao conectar ao banco de dados")
        return None


def criar_mesa(numero):
    if not isinstance(numero, int) or numero <= 0:
        print("❌ Número inválido para a mesa")
        return None

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            # 🔥 Agora o status padrão da mesa é `FALSE` (mesa disponível)
            cur.execute("INSERT INTO mesas (numero, status) VALUES (%s, FALSE) RETURNING id", (numero,))
            mesa_id = cur.fetchone()[0]
            conn.commit()
            return mesa_id
        except Exception as e:
            print(f"❌ Erro ao criar mesa: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("❌ Erro ao conectar ao banco de dados")
        return None


def verificar_status_mesa(mesa_id):
    if not isinstance(mesa_id, int) or mesa_id <= 0:
        print("❌ ID inválido para a mesa")
        return None

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT status FROM mesas WHERE id = %s", (mesa_id,))
            status = cur.fetchone()
            return bool(status[0]) if status else None  # 🔥 Retorna um booleano corretamente
        except Exception as e:
            print(f"❌ Erro ao verificar status da mesa: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("❌ Erro ao conectar ao banco de dados")
        return None


def atualizar_status_mesa(mesa_id, ocupada):
    if not isinstance(mesa_id, int) or mesa_id <= 0:
        print(f"❌ ID da mesa inválido: mesa_id={mesa_id}")
        return False

    if not isinstance(ocupada, bool):  # 🔥 Garante que `ocupada` seja booleano
        print(f"❌ Status inválido: ocupada={ocupada}")
        return False

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("UPDATE mesas SET status = %s WHERE id = %s", (ocupada, mesa_id))
            conn.commit()
            print(f"✅ Mesa {mesa_id} atualizada para {'ocupada' if ocupada else 'disponível'}")
            return True
        except Exception as e:
            print(f"❌ Erro ao atualizar status da mesa {mesa_id}: {e}")
            return False
        finally:
            cur.close()
            conn.close()
    else:
        print("❌ Erro ao conectar ao banco de dados")
        return False


def excluir_mesa(mesa_id):
    if not isinstance(mesa_id, int) or mesa_id <= 0:
        print("❌ ID inválido para a mesa")
        return False

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM mesas WHERE id = %s", (mesa_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"❌ Erro ao excluir mesa: {e}")
            return False
        finally:
            cur.close()
            conn.close()
    else:
        print("❌ Erro ao conectar ao banco de dados")
        return False
