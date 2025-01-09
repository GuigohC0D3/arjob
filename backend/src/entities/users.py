import psycopg2
from flask import jsonify
from ..connection.config import connect_db 
from src.utils import hash_utils 
from src.utils import cryptography_utils

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

# Função para criar um usuário
def create_user(nome, cpf, email, senha, cargo):
    conn = connect_db()
    if not conn:
        return {"error": "Erro ao conectar ao banco de dados"}, 500

    try:
        cur = conn.cursor()

        # Criptografar a senha antes de salvar
        senha_hashed = hash_utils.hash_password(senha)
        cpf_encrypted  = cryptography_utils.encrypt_data(cpf)

        # Log dos dados recebidos (opcional, para depuração)
        print(f"Dados recebidos para inserção: Nome={nome}, CPF={cpf}, Email={email}, Cargo={cargo}")

        cur.execute("""
            INSERT INTO usuarios (nome, cpf, email, senha, cargo)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (nome, cpf, email, senha_hashed, cargo))

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

# Função para verificar usuário pelo CPF e senha
def get_user_by_cpf_and_password(cpf, senha):
    conn = connect_db()
    if not conn:
        print("Erro ao conectar ao banco de dados")
        return None

    try:
        cur = conn.cursor()

        # Busca o usuário com base no CPF
        cur.execute("""
            SELECT id, nome, cpf, email, cargo, senha
            FROM usuarios
            WHERE cpf = %s
        """, (cpf,))

        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            # Mapeia os resultados para um dicionário
            columns = ['id', 'nome', 'cpf', 'email', 'cargo', 'senha']
            user_data = dict(zip(columns, user))

            # Verifica a senha
            if hash_utils.verify_password(senha, user_data['senha']):
                # Remove o hash da senha antes de retornar
                del user_data['senha']
                return user_data
            else:
                print("Senha incorreta")
                return None

        print("Usuário não encontrado")
        return None
    except Exception as e:
        print(f"Erro ao buscar usuário no banco de dados: {e}")
        return None


# def corrigir_senhas():
#     conn = connect_db()
#     if not conn:
#         print("Erro ao conectar ao banco de dados.")
#         return

#     try:
#         cur = conn.cursor()

#         # Buscar usuários com senhas não criptografadas
#         cur.execute("""
#             SELECT id, senha
#             FROM usuarios
#             WHERE LENGTH(senha) < 60
#         """)
#         usuarios = cur.fetchall()

#         if not usuarios:
#             print("Nenhuma senha para corrigir.")
#             return

#         print(f"Encontrados {len(usuarios)} usuários com senhas não criptografadas.")

#         # Atualizar cada senha
#         for usuario in usuarios:
#             user_id, senha = usuario

#             # Gerar hash da senha
#             senha_hashed = hash_utils.hash_password(senha)

#             # Atualizar no banco de dados
#             cur.execute("""
#                 UPDATE usuarios
#                 SET senha = %s
#                 WHERE id = %s
#             """, (senha_hashed, user_id))

#         conn.commit()
#         print("Senhas corrigidas com sucesso.")
#     except psycopg2.Error as e:
#         conn.rollback()
#         print(f"Erro ao corrigir senhas: {e}")
#     finally:
#         conn.close()

# # Executar a função
# corrigir_senhas()


# # Função para corrigir CPFs não criptografados
# def corrigir_cpfs():
#     conn = connect_db()
#     if not conn:
#         print("Erro ao conectar ao banco de dados.")
#         return

#     try:
#         cur = conn.cursor()

#         # Buscar CPFs não criptografados (supondo que CPFs criptografados sejam mais longos)
#         cur.execute("""
#             SELECT id, cpf
#             FROM usuarios
#             WHERE LENGTH(cpf) <= 14  -- CPF puro tem no máximo 11 dígitos
#         """)
#         usuarios = cur.fetchall()

#         if not usuarios:
#             print("Nenhum CPF para corrigir.")
#             return

#         print(f"Encontrados {len(usuarios)} usuários com CPFs não criptografados.")

#         # Atualizar cada CPF
#         for usuario in usuarios:
#             user_id, cpf = usuario

#             # Criptografar o CPF
#             cpf_encrypted = cryptography_utils.encrypt_data(cpf)

#             # Atualizar no banco de dados
#             cur.execute("""
#                 UPDATE usuarios
#                 SET cpf = %s
#                 WHERE id = %s
#             """, (cpf_encrypted, user_id))

#         conn.commit()
#         print("CPFs corrigidos com sucesso.")
#     except psycopg2.Error as e:
#         conn.rollback()
#         print(f"Erro ao corrigir CPFs: {e}")
#     finally:
#         conn.close()

# # Exemplo de execução
# corrigir_cpfs()
