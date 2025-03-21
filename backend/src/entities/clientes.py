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


def add_cliente(nome, cpf, email, telefone, filial, convenio, departamento_id):
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
                "convenio": convenio
            })

            # Inserir cliente e retornar o ID
            cur.execute("""
                INSERT INTO clientes (nome, cpf, email, telefone, filial, convenio)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (nome, cpf, email, telefone, filial, convenio))
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
            cur.execute("SELECT id, nome, cpf FROM clientes WHERE cpf = %s", (cpf,))
            cliente = cur.fetchone()
            cur.close()
            conn.close()

            if cliente:
                return {"id": cliente[0], "nome": cliente[1], "cpf": cliente[2]}, 200
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
            cur.execute("SELECT id, nome, cpf, to_char(criado_em, 'DD/MM/YYYY') FROM clientes")
            clientes = cur.fetchall()
            cur.close()
            conn.close()
            return [{"id": c[0], "nome": c[1], "cpf": c[2], "criado_em": c[3]} for c in clientes]
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
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                UPDATE clientes
                SET status_id = %s
                WHERE id = %s
            """, (novo_status_id, cliente_id))
            conn.commit()
            cur.close()
            conn.close()
            return {"message": "Status atualizado com sucesso!"}, 200
        except Exception as e:
            print(f"Erro ao atualizar status do cliente: {e}")
            return {"error": "Erro ao atualizar status do cliente"}, 500
