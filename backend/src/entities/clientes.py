import psycopg2
from ..connection.config import connect_db
from flask import request, jsonify


def get_clientes():
    conn = connect_db()
    if not conn:
        return {"error": "Erro ao conectar ao banco de dados"}, 500

    try:
        cur = conn.cursor()

        # Query para buscar todos os clientes
        cur.execute("SELECT * FROM clientes")
        rows = cur.fetchall()

        # Converter os resultados para uma lista de dicionários
        clientes = []
        columns = [desc[0] for desc in cur.description]
        for row in rows:
            clientes.append(dict(zip(columns, row)))

        cur.close()
        conn.close()

        return {"data": clientes, "status": 200}, 200
    except Exception as e:
        print(f"Erro ao buscar clientes: {e}")
        return {"error": "Erro ao buscar clientes"}, 500


def add_cliente(nome, cpf, email, telefone, filial, convenio, departamento_id, matricula, limite):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Log para verificar os dados a serem inseridos
            print("Inserindo cliente com dados:", {
                "nome": nome,
                "cpf": cpf,
                "email": email,
                "telefone": telefone,
                "filial": filial,
                "convenio": convenio,
                "matricula": matricula,
                "limite": limite
            })

            # Inserir cliente e retornar o ID
            cur.execute("""
                INSERT INTO clientes (nome, cpf, email, telefone, filial, convenio, matricula, limite)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (nome, cpf, email, telefone, filial, convenio, matricula, limite))
            cliente_id = cur.fetchone()[0]

            # Log do ID do cliente gerado
            print("Cliente inserido com ID:", cliente_id)

            # Inserir associação cliente-departamento
            cur.execute("""
                INSERT INTO departamento_cliente (cliente_id, departamento_id)
                VALUES (%s, %s)
            """, (cliente_id, departamento_id))

            conn.commit()
            cur.close()
            conn.close()

            return {'data': 'Cliente e associação adicionados com sucesso!', 'status': 201}
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar cliente: {e}")  # Log do erro específico
            return {'error': f"Erro ao adicionar cliente: {str(e)}", 'status': 500}
    else:
        print("Erro ao conectar ao banco de dados")
        return {'error': 'Erro ao conectar ao banco de dados', 'status': 500}


def buscar_cliente_por_cpf(cpf):
    try:
        conn = connect_db()
        if conn:
            cur = conn.cursor()
            cur.execute("SELECT id, nome, cpf, filial, convenio FROM clientes WHERE cpf = %s", (cpf,))
            cliente = cur.fetchone()
            cur.close()
            conn.close()

            if cliente:
                return {"id": cliente[0], "nome": cliente[1], "cpf": cliente[2], "filial": cliente[3], "convenio": cliente[4]}, 200
            else:
                return {"error": "Cliente não encontrado"}, 404
    except Exception as e:
        print(f"Erro ao buscar cliente por CPF: {e}")
        return {"error": "Erro interno no servidor"}, 500

def remover_cliente(cliente_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM clientes WHERE id = %s", (cliente_id,))
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            conn.rollback()
            print(f"Erro ao remover cliente: {e}")
    else:
        print("Erro ao conectar ao banco de dados")

def listar_clientes():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
              SELECT id, nome, cpf, 
                     to_char(criado_em, 'DD/MM/YYYY') AS criado_em, 
                     status_id, 
                     limite,
                     saldo
              FROM clientes
            """)
            clientes = cur.fetchall()
            cur.close()
            conn.close()
            # Mapeia os valores para um dicionário
            return [
                {
                    "id": c[0],
                    "nome": c[1],
                    "cpf": c[2],
                    "criado_em": c[3],
                    "status_id": c[4],
                    "limite": c[5],
                    "saldo": c[6]
                }
                for c in clientes
            ]
        except Exception as e:
            print(f"Erro ao buscar clientes no banco de dados: {e}")
            return []
    else:
        print("Erro ao conectar ao banco de dados")
        return []
    

def listar_clientes_status():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, nome FROM status_cliente")
            status_list = [{"id": row[0], "nome": row[1]} for row in cur.fetchall()]
            cur.close()
            conn.close()
            return status_list, 200
        except Exception as e:
            print(f"Erro ao listar status de clientes: {e}")
            return {"error": "Erro ao listar status de clientes"}, 500

        

def atualizar_status_cliente(cliente_id, novo_status_id):
    try:
        conn = connect_db()
        cur = conn.cursor()

        cur.execute("UPDATE clientes SET status_id = %s WHERE id = %s", (novo_status_id, cliente_id))
        conn.commit()
        cur.close()
        conn.close()

        return {"message": "Status do cliente atualizado com sucesso"}
    except Exception as e:
        print(f"❌ Erro ao atualizar status do cliente: {e}")
        return {"error": "Erro ao atualizar status do cliente"}
    

def verificar_limite(cliente_id):
    """
    Consulta o cliente e retorna o limite, quanto foi consumido, o valor disponível e o status de bloqueio.
    """
    conn = connect_db()
    if not conn:
        return {"error": "Erro ao conectar ao banco de dados"}
    try:
        cur = conn.cursor()
        # Busca os valores do limite, quanto já foi consumido e se está bloqueado
        cur.execute("""
            SELECT limite, consumido, bloqueado
            FROM clientes
            WHERE id = %s
        """, (cliente_id,))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return {"error": "Cliente não encontrado"}
        
        limite, consumido, bloqueado = row
        # Converter para float, se necessário
        limite = float(limite)
        consumido = float(consumido)
        disponivel = limite - consumido

        status = "bloqueado" if bloqueado or disponivel <= 0 else "ok"
        mensagem = "Limite esgotado. Cliente bloqueado para convênio." if status == "bloqueado" else f"Limite disponível: R$ {disponivel:.2f}"
        
        cur.close()
        conn.close()

        return {
            "cliente_id": cliente_id,
            "limite": limite,
            "consumido": consumido,
            "disponivel": disponivel,
            "status": status,
            "mensagem": mensagem
        }
    except Exception as e:
        print("Erro ao verificar limite:", e)
        return {"error": "Erro interno no servidor"}
         
def liberar_convenios_mensalmente():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                UPDATE clientes
                SET 
                    consumido = 0,
                    saldo = limite,
                    bloqueado = false
            """)
            conn.commit()
            cur.close()
            conn.close()
            return {"message": "Convênios liberados com sucesso!"}, 200
        except Exception as e:
            print(f"Erro ao liberar convênios: {e}")
            return {"error": "Erro ao liberar convênios"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500