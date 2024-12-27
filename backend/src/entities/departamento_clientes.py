import psycopg2
from ..connection.config import connect_db
from flask import request, jsonify
from psycopg2 import sql



def listar_departamento_cliente():
    """
    Lista todas as associações entre clientes e departamentos.
    """
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT dc.id, c.nome AS cliente_nome, d.nome AS departamento_nome
                FROM departamento_cliente dc
                JOIN clientes c ON dc.cliente_id = c.id
                JOIN departamentos d ON dc.departamento_id = d.id
            """)
            associacoes = cur.fetchall()
            cur.close()
            conn.close()
            return {'data': associacoes, 'status': 200}
        except psycopg2.Error as e:
            print(f"Erro ao listar associações: {e}")
            return {'data': f"Erro ao listar associações: {str(e)}", 'status': 500}
    else:
        return {'data': 'Erro ao conectar ao banco de dados', 'status': 500}



def add_departamento_cliente(cliente_id, departamento_id):
    """
    Adiciona uma nova associação entre cliente e departamento.
    """
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO departamento_cliente (cliente_id, departamento_id)
                VALUES (%s, %s)
            """, (cliente_id, departamento_id))
            conn.commit()
            cur.close()
            conn.close()
            return {'data': 'Associação adicionada com sucesso!', 'status': 201}
        except psycopg2.Error as e:
            print(f"Erro ao adicionar associação: {e}")
            return {'data': f"Erro ao adicionar associação: {str(e)}", 'status': 500}
    else:
        return {'data': 'Erro ao conectar ao banco de dados', 'status': 500}
    
    