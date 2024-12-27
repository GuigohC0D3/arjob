from ..connection.config import connect_db
from ..entities import mesas
import random
import string

def gerar_numero_comanda():
    """
    Gera um número único para a comanda com base em caracteres alfanuméricos.
    """
    # Gera uma sequência de 6 caracteres alfanuméricos únicos
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def criar_comanda(mesa_id, numero_comanda):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO comandas (numero, mesa_id) VALUES (%s, %s)",
                (numero_comanda, mesa_id),
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


def abrir_comanda(mesa_id, numero_comanda):
    try:
        # Verificar se a mesa está disponível
        status = mesas.verificar_status_mesa(mesa_id)
        if status != "disponivel":
            return False, "Mesa já está ocupada"

        # Criar a comanda
        sucesso = criar_comanda(mesa_id, numero_comanda)
        if sucesso:
            # Atualizar o status da mesa para "ocupada"
            mesas.atualizar_status_mesa(mesa_id, "ocupada")
            return True, None
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
            # Atualizar status da comanda
            cur.execute("UPDATE comandas SET status = 'fechada' WHERE id = %s", (comanda_id,))
            conn.commit()

            # Atualizar status da mesa para "disponível"
            cur.execute("""
                UPDATE mesas
                SET status = 'disponivel'
                WHERE id = (SELECT mesa_id FROM comandas WHERE id = %s)
            """, (comanda_id,))
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"Erro ao fechar comanda: {e}")
            return False
    return False



def listar_comandas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, numero, mesa_id, status FROM comandas")
            comandas = cur.fetchall()
            cur.close()
            conn.close()
            return [{"id": c[0], "numero": c[1], "mesa_id": c[2], "status": c[3]} for c in comandas]
        except Exception as e:
            print(f"Erro ao listar comandas: {e}")
            return None
    return None
