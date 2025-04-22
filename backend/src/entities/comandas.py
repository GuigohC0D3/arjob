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


def atualizar_status_comanda(comanda_id, total, mesa_id, itens=None, pagamento_id=None, usuario_id=None, cliente_id=None):
    if itens is None:
        itens = []

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Atualiza a comanda com cliente, pagamento, total e fecha
            cur.execute("""
                UPDATE comandas
                SET cliente_id = %s,
                    pagamento_id = %s,
                    total = %s,
                    status = FALSE,
                    data_fechamento = NOW()
                WHERE id = %s
            """, (cliente_id, pagamento_id, total, comanda_id))

            print(f"🧾 Pagamento ID recebido: {pagamento_id}")
            print(f"👤 Cliente ID recebido: {cliente_id}")
            print(f"💵 Total da comanda: {total}")

            # Lógica de convênio (ex: ID 5 representa convênio)
            if pagamento_id == 5 and cliente_id:
                # Atualiza saldo e consumido do cliente
                cur.execute("""
                    UPDATE clientes
                    SET 
                        consumido = consumido + %s,
                        saldo = saldo - %s
                    WHERE id = %s
                    RETURNING consumido, limite
                """, (total, total, cliente_id))
                result = cur.fetchone()
                if result:
                    consumido, limite = result
                    if consumido >= limite:
                        cur.execute("""
                            UPDATE clientes
                            SET bloqueado = TRUE
                            WHERE id = %s
                        """, (cliente_id,))

            # Libera a mesa
            cur.execute("""
                UPDATE mesas
                SET status = TRUE
                WHERE id = %s
            """, (mesa_id,))

            # Cria histórico da comanda
            cur.execute("""
                INSERT INTO historico_comandas (
                    comanda_id,
                    cliente_id,
                    pagamento_id,
                    total,
                    data_fechamento,
                    usuario_id
                ) VALUES (
                    %s, %s, %s, %s, NOW(), %s
                )
                RETURNING id
            """, (comanda_id, cliente_id, pagamento_id, total, usuario_id))
            historico_id = cur.fetchone()[0]

            # Insere os itens no histórico e atualiza estoque
            for item in itens:
                produto_id = item.get('id')
                quantidade = item.get('quantidade')
                preco_unitario = item.get('preco')

                if None in (produto_id, quantidade, preco_unitario):
                    print(f"❌ Item inválido encontrado: {item}")
                    continue

                cur.execute("""
                    INSERT INTO itens_comanda (
                        comanda_id,
                        produto_id,
                        quantidade,
                        preco_unitario,
                        historico_comanda_id
                    ) VALUES (%s, %s, %s, %s, %s)
                """, (comanda_id, produto_id, quantidade, preco_unitario, historico_id))

                # Atualiza estoque
                cur.execute("""
                    UPDATE produtos
                    SET estoque = estoque - %s
                    WHERE id = %s AND estoque >= %s
                """, (quantidade, produto_id, quantidade))

            conn.commit()
            print(f"✅ Comanda {comanda_id} fechada com sucesso. Histórico ID: {historico_id}")
            return {"message": "Comanda fechada com sucesso!"}, 200

        except Exception as e:
            conn.rollback()
            print(f"❌ Erro ao fechar comanda no banco de dados: {e}")
            return {"error": "Erro ao fechar comanda no banco de dados"}, 500

        finally:
            cur.close()
            conn.close()
    else:
        print("❌ Erro ao conectar ao banco de dados")
        return {"error": "Erro ao conectar ao banco de dados"}, 500


def obter_comanda_por_id(comanda_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.id, c.code, c.mesa_id, c.status, u.id, u.nome
                FROM comandas c
                LEFT JOIN usuarios u ON c.usuario_id = u.id
                WHERE c.id = %s AND c.status = TRUE
            """, (comanda_id,))
            comanda = cur.fetchone()
            cur.close()
            conn.close()

            if comanda:
                return {
                    "id": comanda[0],
                    "code": comanda[1],
                    "mesa_id": comanda[2],
                    "status": comanda[3],
                    "atendente": {
                        "id": comanda[4],
                        "nome": comanda[5]
                    } if comanda[4] else None
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar comanda por id: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None


def obter_comanda_por_id(comanda_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.id, c.code, c.mesa_id, c.status, c.data_abertura,
                       u.id, u.nome
                FROM comandas c
                LEFT JOIN usuarios u ON c.usuario_id = u.id
                WHERE c.id = %s
            """, (comanda_id,))
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
                    "atendente": {
                        "id": comanda[5],
                        "nome": comanda[6]
                    }
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar comanda por ID: {e}")
            return None
    return None




def obter_comanda_por_mesa(mesa_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.id, c.code, c.mesa_id, c.status, u.id, u.nome
                FROM comandas c
                LEFT JOIN usuarios u ON c.usuario_id = u.id
                WHERE c.mesa_id = %s AND c.status = TRUE
                LIMIT 1
            """, (mesa_id,))
            comanda = cur.fetchone()
            cur.close()
            conn.close()

            if comanda:
                return {
                    "id": comanda[0],
                    "code": comanda[1],
                    "mesa_id": comanda[2],
                    "status": comanda[3],
                    "atendente": {
                        "id": comanda[4],
                        "nome": comanda[5]
                    } if comanda[4] else None
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar comanda por mesa: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None

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

def fechar_comanda_completo(comanda_id, mesa_id, itens, total, pagamento_id, usuario_id, cliente_id):
    conn = connect_db()

    if not conn:
        print("❌ Erro ao conectar ao banco de dados")
        return {"error": "Erro ao conectar ao banco de dados"}, 500

    try:
        cur = conn.cursor()

        # 1️⃣ Atualiza a comanda para "fechada" com os dados necessários
        cur.execute("""
            UPDATE comandas
            SET status = FALSE,
                total = %s,
                pagamento_id = %s,
                cliente_id = %s,
                data_fechamento = NOW()
            WHERE id = %s
        """, (total, pagamento_id, cliente_id, comanda_id))

        # 2️⃣ Libera a mesa para "disponível"
        cur.execute("""
            UPDATE mesas
            SET status = TRUE
            WHERE id = %s
        """, (mesa_id,))

        # 3️⃣ Cria o registro no histórico de comandas
        cur.execute("""
            INSERT INTO historico_comandas (
                comanda_id,
                cliente_id,
                pagamento_id,
                total,
                data_fechamento,
                usuario_id
            )
            VALUES (%s, %s, %s, %s, NOW(), %s)
            RETURNING id
        """, (comanda_id, cliente_id, pagamento_id, total, usuario_id))

        historico_id = cur.fetchone()[0]
        print(f"✅ Histórico da comanda criado! ID: {historico_id}")

        # 4️⃣ Adiciona cada item da comanda no histórico e baixa estoque
        for item in itens:
            produto_id = item.get('id')
            quantidade = item.get('quantidade')
            preco_unitario = item.get('preco')

            if not (produto_id and quantidade and preco_unitario):
                print(f"❌ Dados de item inválido: {item}")
                continue

            # ➕ Insere no itens_comanda com referencia ao histórico
            cur.execute("""
                INSERT INTO itens_comanda (
                    comanda_id,
                    produto_id,
                    quantidade,
                    preco_unitario,
                    historico_comanda_id
                )
                VALUES (%s, %s, %s, %s, %s)
            """, (comanda_id, produto_id, quantidade, preco_unitario, historico_id))

            # ➖ Baixa o estoque do produto
            cur.execute("""
                UPDATE produtos
                SET estoque = estoque - %s
                WHERE id = %s
            """, (quantidade, produto_id))


        # Aqui você pode assumir que o 'pagamento_id' específico identifica o convênio (ex.: pagamento_id == 99)
        if pagamento_id == 5:
            # Atualiza o consumo e o saldo
            cur.execute("""
                UPDATE clientes
                SET consumido = consumido + %s,
                    saldo = saldo - %s
                WHERE id = %s
                RETURNING saldo
            """, (total, total, cliente_id))
            novo_saldo = cur.fetchone()[0]
            if novo_saldo <= 0:
                # Bloqueia o cliente caso o saldo não seja suficiente
                cur.execute("UPDATE clientes SET bloqueado = TRUE WHERE id = %s", (cliente_id,))


        conn.commit()
        print(f"✅ Comanda {comanda_id} fechada com sucesso e histórico registrado.")
        return {"message": "Comanda fechada, estoque baixado e histórico salvo!"}, 200

    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao fechar comanda: {e}")
        return {"error": "Erro ao fechar comanda"}, 500

    finally:
        cur.close()
        conn.close()

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


def baixar_estoque(comanda_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Busca itens consumidos
            cur.execute("""
                SELECT produto_id, quantidade
                FROM itens_comanda
                WHERE historico_comanda_id = (
                    SELECT id FROM historico_comandas WHERE comanda_id = %s
                )
            """, (comanda_id,))

            itens = cur.fetchall()

            for produto_id, quantidade in itens:
                cur.execute("""
                    UPDATE produtos
                    SET estoque = estoque - %s
                    WHERE id = %s
                """, (quantidade, produto_id))

            conn.commit()
            cur.close()
            conn.close()

            return {"message": "Estoque atualizado com sucesso!"}

        except Exception as e:
            conn.rollback()
            print(f"❌ Erro ao atualizar estoque: {e}")
            return {"error": "Erro ao atualizar estoque"}

    else:
        return {"error": "Erro ao conectar no banco de dados"}


def listar_comandas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            query = """
                SELECT 
                    c.id,
                    c.code,
                    m.numero AS mesa_numero,
                    cl.nome AS cliente_nome,
                    cl.cpf AS cliente_cpf,
                    u.nome AS atendente_nome,
                    c.total,
                    c.status,
                    c.data_abertura,
                    c.data_fechamento,
                    tp.descricao AS tipos_pagamento
                FROM comandas c
                JOIN mesas m ON c.mesa_id = m.id
                LEFT JOIN clientes cl ON c.cliente_id = cl.id
                LEFT JOIN usuarios u ON c.usuario_id = u.id
                LEFT JOIN tipos_pagamento tp ON c.pagamento_id = tp.id
                WHERE c.status = FALSE
                ORDER BY c.data_fechamento DESC
            """

            cur.execute(query)
            registros = cur.fetchall()

            cur.close()
            conn.close()

            comandas_listadas = []
            for comanda in registros:
                comandas_listadas.append({
                    "id": comanda[0],
                    "code": comanda[1],
                    "mesa": comanda[2],
                    "cliente": comanda[3] or "Não informado",
                    "cpf": comanda[4] or "Não informado",
                    "atendente": comanda[5] or "Não informado",
                    "total": float(comanda[6]) if comanda[6] else 0.00,
                    "status": comanda[7],
                    "data_abertura": comanda[8].isoformat() if comanda[8] else None,
                    "data_fechamento": comanda[9].isoformat() if comanda[9] else None,
                    "tipos_pagamento": comanda[10] or "Não informado"
                })

            return comandas_listadas

        except Exception as e:
            print(f"Erro ao listar comandas fechadas: {e}")
            return []
    else:
        print("Erro ao conectar ao banco de dados")
        return []