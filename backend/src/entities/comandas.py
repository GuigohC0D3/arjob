from ..connection.config import connect_db
from ..entities import mesas
import random
import string

def gerar_numero_comanda():
    """
    Gera um número único para a comanda com base em caracteres alfanuméricos.
    """
    conn = connect_db()
    if conn:
        cur = conn.cursor()
        while True:
            numero = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            cur.execute("SELECT 1 FROM comandas WHERE numero = %s", (numero,))
            if not cur.fetchone():  # Número único
                cur.close()
                conn.close()
                return numero
    else:
        raise Exception("Erro ao conectar ao banco de dados")

def criar_comanda(mesa_id, numero_comanda):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO comandas (numero, mesa_id, status) VALUES (%s, %s, %s)",
                (numero_comanda, mesa_id, 'aberta'),
            )
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"Erro ao criar comanda: {e}")
            return False
    else:
        print("Erro ao conectar ao banco de dados")
        return False

def abrir_comanda(mesa_id):
    try:
        if not isinstance(mesa_id, int) or mesa_id <= 0:
            return False, "ID da mesa inválido"

        # Verificar status da mesa
        status = mesas.verificar_status_mesa(mesa_id)
        if status is None:
            return False, "Mesa não encontrada"
        if status != "disponivel":
            return False, "Mesa já está ocupada"

        # Gerar número único para a comanda
        numero_comanda = gerar_numero_comanda()

        # Criar a comanda
        sucesso = criar_comanda(mesa_id, numero_comanda)
        if sucesso:
            # Atualizar o status da mesa para "ocupada"
            mesas.atualizar_status_mesa(mesa_id, "ocupada")
            return True, numero_comanda
        else:
            return False, "Erro ao criar comanda no banco de dados"
    except Exception as e:
        print(f"Erro no controlador ao abrir comanda: {e}")
        return False, "Erro interno no servidor"

def fechar_comanda(comanda_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Validar se a comanda está aberta
            cur.execute("SELECT id FROM comandas WHERE id = %s AND status = 'aberta'", (comanda_id,))
            if not cur.fetchone():
                return False, "Comanda não encontrada ou já fechada"

            # Atualizar status da comanda
            cur.execute("UPDATE comandas SET status = 'fechada' WHERE id = %s", (comanda_id,))
            conn.commit()

            # Atualizar status da mesa para "disponível"
            cur.execute(
                """
                UPDATE mesas
                SET status = 'disponivel'
                WHERE id = (SELECT mesa_id FROM comandas WHERE id = %s)
                """,
                (comanda_id,)
            )
            conn.commit()
            cur.close()
            conn.close()
            return True, None
        except Exception as e:
            print(f"Erro ao fechar comanda: {e}")
            return False, "Erro ao fechar comanda no banco de dados"
    return False, "Erro ao conectar ao banco de dados"

def listar_comandas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, numero, mesa_id, status FROM comandas")
            comandas = cur.fetchall()
            cur.close()
            conn.close()
            return [
                {"id": c[0], "numero": c[1], "mesa_id": c[2], "status": c[3]} for c in comandas
            ]
        except Exception as e:
            print(f"Erro ao listar comandas: {e}")
            return None
    return None

def obter_comanda_por_mesa(mesa_id):
    if not isinstance(mesa_id, int) or mesa_id <= 0:
        print("ID inválido para a mesa")
        return None

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id, numero, mesa_id, status, data_abertura
                FROM comandas
                WHERE mesa_id = %s AND status = 'aberta'
                """,
                (mesa_id,),
            )
            comanda = cur.fetchone()

            if comanda:
                return {
                    "id": comanda[0],
                    "numero": comanda[1],
                    "mesa_id": comanda[2],
                    "status": comanda[3],
                    "data_abertura": comanda[4].isoformat() if comanda[4] else None,
                }
            return None
        except Exception as e:
            print(f"Erro ao obter comanda por mesa: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    else:
        print("Erro ao conectar ao banco de dados")
        return None
