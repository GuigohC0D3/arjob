from ..connection.config import connect_db
from ..entities import mesas
from datetime import datetime
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

def criar_comanda(mesa_id, cliente_id):
    """
    Cria uma nova comanda associada a uma mesa e a um cliente.
    """
    conn = connect_db()
    if conn:
        try:
            numero_comanda = gerar_numero_comanda()  # Função para gerar número único
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO comandas (numero, mesa_id, cliente_id, status)
                VALUES (%s, %s, %s, %s)
                """,
                (numero_comanda, mesa_id, cliente_id, 'aberta'),
            )
            conn.commit()
            cur.close()
            conn.close()
            return {"id": numero_comanda}, 201
        except Exception as e:
            conn.rollback()
            print(f"Erro ao criar comanda: {e}")
            return {"error": "Erro ao criar comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500



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

def atualizar_status_comanda(comanda_id, total, mesa_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Atualiza a comanda
            cur.execute("""
                UPDATE comandas
                SET status = 'fechada', total = %s, data_fechamento = NOW()
                WHERE id = %s
            """, (total, comanda_id))

            # Libera a mesa
            cur.execute("""
                UPDATE mesas
                SET status = 'disponivel'
                WHERE id = %s
            """, (mesa_id,))

            conn.commit()
            cur.close()
            conn.close()

            return {"message": "Comanda fechada com sucesso!"}, 200
        except Exception as e:
            conn.rollback()
            print(f"Erro ao fechar comanda no banco de dados: {e}")
            return {"error": "Erro ao fechar comanda no banco de dados"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500

def listar_comandas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.numero, c.mesa_id, c.status, c.data_fechamento, 
                       cl.nome AS cliente, cl.cpf, c.total, u.nome AS atendente
                FROM comandas c
                LEFT JOIN clientes cl ON c.cliente_cpf = cl.cpf
                LEFT JOIN users u ON c.atendente_id = u.id
            """)
            comandas = cur.fetchall()
            cur.close()
            conn.close()
            return [
                {
                    "id": c[0],
                    "mesa": c[1],
                    "status": c[2],
                    "data_fechamento": c[3],
                    "cliente": c[4],
                    "cpf": c[5],
                    "total": c[6],
                    "atendente": c[7],
                }
                for c in comandas
            ]
        except Exception as e:
            print(f"Erro ao listar comandas: {e}")
            return None
    return None

def listar_comandas_fechadas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.id, c.numero, c.mesa_id, c.status, c.total, c.data_fechamento,
                       m.numero AS mesa_numero
                FROM comandas c
                JOIN mesas m ON c.mesa_id = m.id
                WHERE c.status = 'fechada'
                ORDER BY c.data_fechamento DESC
            """)
            comandas = cur.fetchall()
            cur.close()
            conn.close()

            return [
                {
                    "id": c[0],
                    "numero": c[1],
                    "mesa_id": c[2],
                    "status": c[3],
                    "total": c[4],
                    "data_fechamento": c[5].isoformat() if c[5] else None,
                    "mesa_numero": c[6],
                }
                for c in comandas
            ]
        except Exception as e:
            print(f"Erro ao listar comandas fechadas: {e}")
            return []
    else:
        print("Erro ao conectar ao banco de dados")
        return []


def obter_comanda_por_mesa(mesa_id):
    """
    Retorna a comanda ativa para uma mesa, se existir.
    """
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, numero, mesa_id, status
                FROM comandas
                WHERE mesa_id = %s AND status = 'aberta'
            """, (mesa_id,))
            comanda = cur.fetchone()
            cur.close()
            conn.close()

            if comanda:
                return {
                    "id": comanda[0],
                    "numero": comanda[1],
                    "mesa_id": comanda[2],
                    "status": comanda[3]
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar comanda por mesa: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None




def obter_comanda_por_numero(numero_comanda):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, numero, mesa_id, status, data_abertura FROM comandas WHERE numero = %s",
                (numero_comanda,),
            )
            comanda = cur.fetchone()
            cur.close()
            conn.close()

            if comanda:
                return {
                    "id": comanda[0],
                    "numero": comanda[1],
                    "mesa_id": comanda[2],
                    "status": comanda[3],
                    "data_abertura": comanda[4],
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar comanda pelo número: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None


