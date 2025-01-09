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

def create_user(nome, cpf, email, senha, cargo):
    conn = connect_db()
    if not conn:
        return {"error": "Erro ao conectar ao banco de dados"}, 500

    try:
        cur = conn.cursor()

        # Log dos dados recebidos
        print(f"Dados recebidos para inserção: Nome={nome}, CPF={cpf}, Email={email}, Cargo={cargo}")

        cur.execute("""
            INSERT INTO usuarios (nome, cpf, email, senha, cargo)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (nome, cpf, email, senha, cargo))

        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Usuário inserido com sucesso: ID={user_id}")
        return {"data": {"user_id": user_id, "message": "Usuário registrado com sucesso!"}, "status": 201}
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Erro ao registrar usuário: {e}")
        return {"error": f"Erro ao registrar usuário: {str(e)}", "status": 500}
    
def get_user_by_cpf_and_password(cpf, senha):
    conn = connect_db()
    if not conn:
        print("Erro ao conectar ao banco de dados")
        return None

    try:
        cur = conn.cursor()

        # Busca o usuário com base no CPF e senha
        cur.execute("""
            SELECT id, nome, cpf, email, cargo
            FROM usuarios
            WHERE cpf = %s AND senha = %s
        """, (cpf, senha))

        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            # Mapeia os resultados para um dicionário
            columns = ['id', 'nome', 'cpf', 'email', 'cargo']
            return dict(zip(columns, user))

        return None  # Retorna None se o usuário não for encontrado
    except Exception as e:
        print(f"Erro ao buscar usuário no banco de dados: {e}")
        return None


