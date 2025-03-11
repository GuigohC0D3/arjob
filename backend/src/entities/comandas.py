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

def criar_comanda(mesa_id, usuario_id):
    conn = connect_db()
    if conn:
        try:
            numero_comanda = gerar_numero_comanda()  # ✅ Gera número único da comanda
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO comandas (code, mesa_id, usuario_id, status, data_abertura)
                VALUES (%s, %s, %s, TRUE, NOW()) RETURNING id
                """,
                (numero_comanda, mesa_id, usuario_id),
            )
            comanda_id = cur.fetchone()[0]  # 🔥 Pegamos o ID da nova comanda
            conn.commit()
            cur.close()
            conn.close()
            return {"id": comanda_id}, 201
        except Exception as e:
            conn.rollback()
            print(f"❌ Erro ao criar comanda: {e}")
            return {"error": "Erro ao criar comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500


def abrir_comanda(mesa_id, usuario_id):
    """Cria uma comanda e atualiza a mesa para ocupada."""
    conn = connect_db()
    if conn:
        try:
            numero_comanda = gerar_numero_comanda()
            cur = conn.cursor()

            # 🔥 Verifica se já existe uma comanda aberta para essa mesa
            cur.execute("SELECT id FROM comandas WHERE mesa_id = %s AND status = TRUE LIMIT 1", (mesa_id,))
            comanda_existente = cur.fetchone()

            if comanda_existente:
                return {"message": "Comanda já existente", "id": comanda_existente[0]}, 200

            # 🔥 Cria uma nova comanda
            cur.execute(
                """
                INSERT INTO comandas (code, mesa_id, usuario_id, status, data_abertura)
                VALUES (%s, %s, %s, TRUE, NOW()) RETURNING id
                """,
                (numero_comanda, mesa_id, usuario_id),
            )
            comanda_id = cur.fetchone()[0]

            # 🔥 Atualiza o status da mesa para ocupada (vermelha)
            cur.execute("UPDATE mesas SET status = TRUE WHERE id = %s", (mesa_id,))

            conn.commit()
            cur.close()
            conn.close()

            return {"id": comanda_id}, 201

        except Exception as e:
            conn.rollback()
            print(f"❌ Erro ao abrir comanda: {e}")
            return {"error": "Erro ao abrir comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500


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
            print(f"❌ Erro ao fechar comanda no banco de dados: {e}")
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
            print(f"❌ Erro ao listar comandas: {e}")
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
            print(f"❌ Erro ao buscar comanda por código: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None


def obter_comanda_por_mesa(mesa_id):
    """Retorna a comanda aberta de uma mesa."""
    
    conn = connect_db()
    if not conn:
        return None

    try:
        cur = conn.cursor()
        # 🔥 Agora buscamos `status` como BOOLEAN corretamente
        cur.execute("SELECT id, mesa_id, status, code FROM comandas WHERE mesa_id = %s AND status = TRUE LIMIT 1", (mesa_id,))
        comanda = cur.fetchone()

        if comanda:
            return {
                "id": comanda[0],
                "mesa_id": comanda[1],  # ✅ Agora retornamos corretamente o ID da mesa
                "status": comanda[2],   # ✅ `status` já vem como BOOLEAN do banco
                "code": comanda[3]
            }
        else:
            return None  # 🔥 Retorna `None` corretamente se não houver comanda

    except Exception as e:
        print(f"❌ Erro ao buscar comanda da mesa {mesa_id}: {e}")
        return None

    finally:
        cur.close()
        conn.close()


def fechar_comanda(comanda_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # 🔥 Buscar os itens da comanda
            cur.execute("SELECT produto_id, quantidade FROM itens_comanda WHERE comanda_id = %s", (comanda_id,))
            itens = cur.fetchall()

            # 🔥 Atualizar o estoque de cada produto corretamente
            for item in itens:
                produto_id, quantidade = item
                cur.execute("UPDATE produtos SET estoque = estoque - %s WHERE id = %s", (quantidade, produto_id))

            # 🔥 Atualiza o status da comanda para fechada
            cur.execute("UPDATE comandas SET status = FALSE, data_fechament = NOW() WHERE id = %s", (comanda_id,))

            conn.commit()
            cur.close()
            conn.close()
            return {"message": "Comanda fechada e estoque atualizado com sucesso!"}, 200

        except Exception as e:
            conn.rollback()
            print(f"Erro ao fechar comanda: {e}")
            return {"error": "Erro ao fechar comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500


def adicionar_item_na_comanda(comanda_id, produto_id, quantidade, preco_unitario):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # 🔍 Verifica se o item já existe na comanda
            cur.execute("""
                SELECT id, quantidade FROM itens_comanda
                WHERE comanda_id = %s AND produto_id = %s
            """, (comanda_id, produto_id))

            existente = cur.fetchone()

            if existente:
                # 📝 Atualiza a quantidade se já existe
                novo_total = existente[1] + quantidade
                cur.execute("""
                    UPDATE itens_comanda
                    SET quantidade = %s
                    WHERE id = %s
                """, (novo_total, existente[0]))
            else:
                # ➕ Insere o item se não existe
                cur.execute("""
                    INSERT INTO itens_comanda (comanda_id, produto_id, quantidade, preco_unitario)
                    VALUES (%s, %s, %s, %s)
                """, (comanda_id, produto_id, quantidade, preco_unitario))

            conn.commit()
            cur.close()
            conn.close()

            return {"message": "Produto adicionado/atualizado com sucesso!"}, 201

        except Exception as e:
            conn.rollback()
            print(f"Erro ao adicionar item na comanda: {e}")
            return {"error": "Erro ao adicionar item na comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500


def atualizar_quantidade_item(comanda_id, produto_id, nova_quantidade):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Atualiza a quantidade do item na comanda
            cur.execute("""
                UPDATE itens_comanda 
                SET quantidade = %s 
                WHERE comanda_id = %s AND produto_id = %s
            """, (nova_quantidade, comanda_id, produto_id))

            conn.commit()
            cur.close()
            conn.close()
            return {"message": "Quantidade atualizada com sucesso!"}, 200

        except Exception as e:
            conn.rollback()
            print(f"Erro ao atualizar item na comanda: {e}")
            return {"error": "Erro ao atualizar item na comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500


def obter_itens_comanda(comanda_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT ic.produto_id, p.nome, ic.quantidade, ic.preco_unitario
                FROM itens_comanda ic
                JOIN produtos p ON ic.produto_id = p.id
                WHERE ic.comanda_id = %s
            """, (comanda_id,))

            itens = cur.fetchall()
            cur.close()
            conn.close()

            return [
                {"id": item[0], "nome": item[1], "quantidade": item[2], "preco": float(item[3])}
                for item in itens
            ], 200
        except Exception as e:
            print(f"Erro ao obter itens da comanda: {e}")
            return {"error": "Erro ao obter itens da comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500


def remover_item_da_comanda(comanda_id, produto_id):
    try:
        conn = connect_db()
        if conn:
            cur = conn.cursor()

            # Verifica se o item existe
            cur.execute("""
                SELECT quantidade
                FROM itens_comanda
                WHERE comanda_id = %s AND produto_id = %s
            """, (comanda_id, produto_id))
            
            item = cur.fetchone()

            if not item:
                return {"error": "Item não encontrado"}, 404

            # Remove o item
            cur.execute("""
                DELETE FROM itens_comanda
                WHERE comanda_id = %s AND produto_id = %s
            """, (comanda_id, produto_id))

            conn.commit()

            cur.close()
            conn.close()

            return {"message": "Item removido com sucesso"}, 200
        else:
            return {"error": "Erro ao conectar ao banco de dados"}, 500
    except Exception as e:
        print(f"Erro ao remover item da comanda: {e}")
        return {"error": "Erro interno no servidor"}, 500

def buscar_itens_da_comanda(comanda_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, produto_id, quantidade, preco_unitario
                FROM itens_comanda
                WHERE comanda_id = %s
            """, (comanda_id,))
            
            itens = cur.fetchall()
            cur.close()
            conn.close()

            return [
                {
                    "id": item[0],
                    "produto_id": item[1],
                    "quantidade": item[2],
                    "preco_unitario": float(item[3]),
                }
                for item in itens
            ], 200
        except Exception as e:
            print(f"Erro ao buscar itens: {e}")
            return {"error": "Erro interno ao buscar itens da comanda"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500
