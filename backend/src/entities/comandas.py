from ..connection.config import connect_db
from ..entities import mesas, clientes, comandas, users
from datetime import datetime
import random
import string




def gerar_numero_comanda():
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

def criar_comanda(mesa_id, usuario_id):  # ✅ Agora recebe `usuario_id`
    conn = connect_db()
    if conn:
        try:
            numero_comanda = gerar_numero_comanda()  # ✅ Gera número único da comanda
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO comandas (code, mesa_id, usuario_id, status, data_abertura)
                VALUES (%s, %s, %s, 'aberta', NOW())
                """,
                (numero_comanda, mesa_id, usuario_id),
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

def abrir_comanda(mesa_id, atendente_id):
    try:
        # Verifica se o atendente_id realmente tem o cargo de atendente
        if not users.verificar_se_usuario_eh_atendente(atendente_id):
            return {"error": "Usuário selecionado não é um atendente."}, 403

        # Verifica se já existe uma comanda ativa na mesa
        comanda_existente = comandas.obter_comanda_por_mesa(mesa_id)
        if comanda_existente:
            return {"error": "Já existe uma comanda ativa para esta mesa."}, 400

        # Cria uma nova comanda sem CPF do cliente, mas com atendente
        response, status_code = comandas.criar_comanda(mesa_id, atendente_id)

        if status_code == 201:
            # Atualiza o status da mesa para ocupada
            mesas.atualizar_status_mesa(mesa_id, "ocupada")

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


