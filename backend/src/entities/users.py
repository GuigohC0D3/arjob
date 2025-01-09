import psycopg2
from ..connection.config import connect_db
from flask import jsonify

def get_usuarios():
    conn = connect_db()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM usuarios")
                usuarios = cur.fetchall()

            return jsonify({'data': usuarios, 'status': 201})
        except psycopg2.Error as e:
            print(f"Erro ao listar usuários: {e}")
            return jsonify({'error': 'Erro ao listar usuários'}), 500
        finally:
            conn.close()
    else:
        return jsonify({'error': 'Erro ao conectar ao banco de dados'}), 500

def add_usuario(nome, cpf, email, senha_hash, cargo):
    conn = connect_db()
    if conn:
        try:
            with conn.cursor() as cur:
                # Inserir o usuário e retornar o ID
                cur.execute(
                    """
                    INSERT INTO usuarios (nome, cpf, email, senha_hash, cargo)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id
                    """,
                    (nome, cpf, email, senha_hash, cargo)
                )
                usuario_id = cur.fetchone()[0]

                # Confirmar as alterações
                conn.commit()

            return {"message": "Usuário cadastrado com sucesso!", "usuario_id": usuario_id}, 201
        except Exception as e:
            conn.rollback()
            print(f"Erro ao cadastrar usuário: {e}")
            return {"error": "Erro ao cadastrar usuário"}, 500
        finally:
            conn.close()
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500
