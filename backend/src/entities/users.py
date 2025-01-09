import psycopg2
from ..connection.config import connect_db
from flask import jsonify


def get_clientes():
    conn = connect_db()
    if not conn:
        return jsonify({"error": "Erro ao conectar ao banco de dados"}), 500

    try:
        cur = conn.cursor()

        # Query para buscar todos os clientes
        cur.execute("SELECT * FROM usuarios")
        rows = cur.fetchall()

        # Converter os resultados para uma lista de dicionários
        usuarios = []
        columns = [desc[0] for desc in cur.description]
        for row in rows:
            usuarios.append(dict(zip(columns, row)))

        cur.close()
        conn.close()

        return jsonify({"data": usuarios, "status": 200}), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar clientes: {e}")
        if conn:
            conn.close()
        return jsonify({"error": "Erro ao buscar clientes"}), 500


def add_usuario(nome, email, cpf, senha_hash, cargo_id):
    conn = connect_db()
    if not conn:
        print("Erro ao conectar ao banco de dados")
        return jsonify({'error': 'Erro ao conectar ao banco de dados', 'status': 500})

    try:
        cur = conn.cursor()

        # Log para verificar os dados a serem inseridos
        print("Inserindo usuário com dados:", {
            "nome": nome,
            "cpf": cpf,
            "email": email,
            "senha_hash": senha_hash,
        })

        # Inserir usuário e retornar o ID
        cur.execute("""
            INSERT INTO usuarios (nome, email, cpf, senha_hash)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (nome, email, cpf, senha_hash))
        usuario_id = cur.fetchone()[0]

        # Log do ID do usuário gerado
        print("Usuário inserido com ID:", usuario_id)

        # Inserir associação usuário-cargo
        cur.execute("""
            INSERT INTO cargo_usuario (usuario_id, cargo_id)
            VALUES (%s, %s)
        """, (usuario_id, cargo_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'data': 'Usuário e associação adicionados com sucesso!', 'status': 201}), 201
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        print(f"Erro ao adicionar usuário: {e}")  # Log do erro específico
        return jsonify({'error': f"Erro ao adicionar usuário: {str(e)}", 'status': 500}), 500
    finally:
        if conn:
            conn.close()
