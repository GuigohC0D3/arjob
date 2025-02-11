from ..connection.config import connect_db
from ..entities import mesas, clientes, comandas
from datetime import datetime
import random
import string

def gerar_code_comanda():
    """
    Gera um código único para a comanda com base em caracteres alfanuméricos.
    """
    conn = connect_db()
    if conn:
        cur = conn.cursor()
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            cur.execute("SELECT 1 FROM comandas WHERE code = %s", (code,))
            if not cur.fetchone():  # Código único
                cur.close()
                conn.close()
                return code
    else:
        raise Exception("Erro ao conectar ao banco de dados")

def criar_comanda(mesa_id, cliente_id):
    conn = connect_db()
    if conn:
        try:
            code_comanda = gerar_code_comanda()  # Gera um código único para a comanda
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO comandas (code, mesa_id, cliente_id, status)
                VALUES (%s, %s, %s, %s) RETURNING id
                """,
                (code_comanda, mesa_id, cliente_id, 'aberta'),
            )
            comanda_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return {"id": comanda_id, "code": code_comanda}, 201
        except Exception as e:
            conn.rollback()
            print(f"Erro ao criar comanda: {e}")
            return {"error": "Erro ao criar comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500

def abrir_comanda(mesa_id, cliente_cpf):
    try:
        # Busca o cliente pelo CPF
        cliente, status_code = clientes.buscar_cliente_por_cpf(cliente_cpf)
        if status_code != 200:
            return cliente, status_code

        cliente_id = cliente.get("id")

        # Verifica se já existe uma comanda ativa na mesa
        comanda_existente = obter_comanda_por_mesa(mesa_id)
        if comanda_existente:
            return {"error": "Já existe uma comanda ativa para esta mesa."}, 400

        # Cria uma nova comanda com o cliente_id
        response, status_code = criar_comanda(mesa_id, cliente_id)

        if status_code == 201:
            # 🔥 Atualiza a mesa para `True` (ocupada)
            conn = connect_db()
            if conn:
                cur = conn.cursor()
                cur.execute("UPDATE mesas SET status = TRUE WHERE id = %s", (mesa_id,))
                conn.commit()
                cur.close()
                conn.close()

        return response, status_code
    except Exception as e:
        print(f"Erro ao abrir comanda no controlador: {e}")
        return {"error": "Erro interno no servidor"}, 500

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
                SELECT c.code, c.mesa_id, c.status, c.data_fechamento, 
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

def obter_comanda_por_code(code):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, code, mesa_id, status, total, cliente_id
                FROM comandas
                WHERE code = %s
            """, (code,))
            comanda = cur.fetchone()
            cur.close()
            conn.close()

            if comanda:
                return {
                    "id": comanda[0],
                    "code": comanda[1],
                    "mesa_id": comanda[2],
                    "status": comanda[3],
                    "total": comanda[4],
                    "cliente_id": comanda[5]
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar comanda por código: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None


def obter_comanda_por_mesa(mesa_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.id, c.code, c.mesa_id, c.status, cl.nome, cl.cpf
                FROM comandas c
                LEFT JOIN clientes cl ON c.cliente_id = cl.id
                WHERE c.mesa_id = %s AND c.status = 'aberta'
            """, (mesa_id,))
            comanda = cur.fetchone()
            cur.close()
            conn.close()

            if comanda:
                return {
                    "id": comanda[0],
                    "code": comanda[1] if comanda[1] else "MISSING_CODE",  # 🔥 Se code for None, retorna "MISSING_CODE"
                    "mesa_id": comanda[2],
                    "status": comanda[3],
                    "cliente": comanda[4] or "Desconhecido",
                    "cpf": comanda[5] or "Não informado"
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar comanda por mesa: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None


def fechar_comanda(code, total, mesa_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # 🔥 Buscar comanda pelo código
            comanda = obter_comanda_por_code(code)
            if not comanda:
                return {"error": "Comanda não encontrada"}, 404

            comanda_id = comanda["id"]  # Pegamos o ID correto baseado no `code`

            # Atualiza a comanda para "fechada"
            cur.execute("""
                UPDATE comandas
                SET status = 'fechada', total = %s, data_fechamento = NOW()
                WHERE id = %s
            """, (total, comanda_id))

            # Atualiza a mesa para "disponível"
            cur.execute("""
                UPDATE mesas
                SET status = FALSE
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
