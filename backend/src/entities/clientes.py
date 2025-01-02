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
    """
    Adiciona um cliente e cria a associação com um departamento.
    """
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
    """
    Busca cliente pelo CPF.
    """
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            # Remover pontuação para normalizar o CPF
            cpf = cpf.replace('.', '').replace('-', '')
            cur.execute("""
                SELECT nome, cpf, email, telefone, filial, convenio
                FROM clientes
                WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), '/', '') = %s
            """, (cpf,))
            cliente = cur.fetchone()
            cur.close()
            conn.close()

            if cliente:
                return {
                    "nome": cliente[0],
                    "cpf": cliente[1],
                    "email": cliente[2],
                    "telefone": cliente[3],
                    "filial": cliente[4],
                    "convenio": cliente[5]
                }, 200
            else:
                return {"error": "Cliente não encontrado"}, 404
        except Exception as e:
            print(f"Erro ao buscar cliente no banco de dados: {e}")
            return {"error": "Erro interno no servidor"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500
