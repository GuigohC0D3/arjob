import psycopg2
from flask import jsonify
from ..connection.config import connect_db 
from src.utils import hash_utils
from src.utils.hash_utils import bcrypt
from src.utils import cryptography_utils
from flask_jwt_extended import create_access_token
from datetime import timedelta
from flask_mail import Message
from src.extensions import mail 

def generate_verification_token(user_id):
    return create_access_token(identity=str(user_id), expires_delta=timedelta(days=7))


def get_by_id(user_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT
                    id
                FROM
                    usuarios
                WHERE
                    id = %s
                """,
                (user_id,),
            )
            usuario = cur.fetchone()
            cur.close()
            conn.close()

            if usuario :
                return int(usuario[0])
            return None
        except Exception as e:
            print(f"Erro ao buscar usuário no banco de dados: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None


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
def create_user(nome, cpf, email, senha):
    conn = connect_db()
    if conn:
        try:
            senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            cur = conn.cursor()

            # Criar usuário com status "Pendente"
            cur.execute(
                """
                INSERT INTO usuarios (nome, cpf, email, senha, ativo, criado_em, status_id)
                VALUES (%s, %s, %s, %s, %s, NOW(), %s)
                RETURNING id
                """,
                (nome, cpf, email, senha_hash, True, 3),  # 3 = "Pendente"
            )
            usuario_id = cur.fetchone()[0]
            
            conn.commit()
            cur.close()
            conn.close()

            return {"message": "Usuário registrado! Verifique seu e-mail para ativar a conta.", "id": usuario_id}, 201
        except Exception as e:
            conn.rollback()
            print(f"Erro ao registrar usuário: {e}")
            return {"error": "Erro ao registrar usuário"}, 500
    else:
        return {"error": "Erro ao conectar ao banco de dados"}, 500

def listar_usuarios():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT u.id, u.nome, u.email, u.cpf, u.criado_em, c.nome AS cargo
                FROM usuarios u
                LEFT JOIN cargo_usuario cu ON u.id = cu.usuario_id
                LEFT JOIN cargos c ON cu.cargo_id = c.id
            """)
            usuarios_lista = cur.fetchall()
            cur.close()
            conn.close()
            return [
                {
                    "id": u[0],
                    "nome": u[1],
                    "email": u[2],
                    "cpf": u[3],
                    "criado_em": u[4],
                    "cargo": u[5]
                }
                for u in usuarios_lista
            ]
        except Exception as e:
            print(f"Erro ao listar usuários: {e}")
            return []
    else:
        print("Erro ao conectar ao banco de dados")
        return []

def listar_usuarios_com_permissoes():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT u.id, u.nome, u.email, u.cpf,
                       json_agg(p.nome) AS permissoes, to_char(criado_em, 'DD/MM/YYYY')
                FROM usuarios u
                LEFT JOIN permissoes_usuario pu ON u.id = pu.usuario_id
                LEFT JOIN permissoes p ON pu.permissao_id = p.id
                GROUP BY u.id
            """)
            usuarios = cur.fetchall()
            cur.close()
            conn.close()
            return [
                {
                    "id": usuario[0],
                    "nome": usuario[1],
                    "email": usuario[2],
                    "cpf": usuario[3],
                    "permissoes": usuario[4] or [],
                    "criado_em": usuario[5]
                }
                for usuario in usuarios
            ], 200
        except Exception as e:
            print(f"Erro ao listar usuários com permissões: {e}")
            return [], 500
    else:
        print("Erro ao conectar ao banco de dados")
        return [], 500


def definir_permissoes(usuario_id, permissoes):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            for permissao in permissoes:
                cur.execute(
                    """
                    INSERT INTO permissoes_usuario (usuario_id, permissao)
                    VALUES (%s, %s)
                    """,
                    (usuario_id, permissao),
                )
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Erro ao definir permissões: {e}")
            return False
    else:
        print("Erro ao conectar ao banco de dados.")
        return False


# Função para verificar usuário pelo CPF e senha
def get_user_by_cpf_and_password(cpf, senha):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT u.id, u.nome, u.cpf, u.email, u.senha, c.nome AS cargo
                FROM usuarios u
                JOIN cargo_usuario cu ON u.id = cu.usuario_id
                JOIN cargos c ON cu.cargo_id = c.id
                WHERE u.cpf = %s
            """, (cpf,))
            user = cur.fetchone()
            cur.close()
            conn.close()

            if user and bcrypt.checkpw(senha.encode("utf-8"), user[4].encode("utf-8")):
                return {
                    "id": user[0],
                    "nome": user[1],
                    "cpf": user[2],
                    "email": user[3],
                    "cargo": user[5],
                }
            return None
        except Exception as e:
            print(f"Erro ao buscar usuário no banco de dados: {e}")
            return None
    return None

def get_user_cargo(usuario_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.nome
                FROM cargos c
                INNER JOIN cargo_usuario cu ON c.id = cu.cargo_id
                WHERE cu.usuario_id = %s
            """, (usuario_id,))
            cargo = cur.fetchone()
            cur.close()
            conn.close()

            if cargo:
                return cargo[0]  # Retorna o nome do cargo
            return None
        except Exception as e:
            print(f"Erro ao buscar cargo do usuário no banco de dados: {e}")
            return None
    else:
        print("Erro ao conectar ao banco de dados")
        return None

def get_user_permissions(user_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT p.nome
                FROM permissoes_usuario pu
                JOIN permissoes p ON pu.permissao_id = p.id
                WHERE pu.usuario_id = %s
            """, (user_id,))
            permissoes = [row[0] for row in cur.fetchall()]
            cur.close()
            conn.close()
            return permissoes
        except Exception as e:
            print(f"Erro ao buscar permissões no banco de dados: {e}")
            return []
    else:
        print("Erro ao conectar ao banco de dados")
        return []

def authenticate_user(cpf, senha):
    conn = connect_db()
    if not conn:
        return None

    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT u.id, u.nome, u.senha, c.nome AS cargo
            FROM usuarios u
            LEFT JOIN cargo_usuario cu ON u.id = cu.usuario_id
            LEFT JOIN cargos c ON cu.cargo_id = c.id
            WHERE u.cpf = %s;
        """, (cpf,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user:
            # Verificar se a senha é válida
            if bcrypt.checkpw(senha.encode('utf-8'), user[2].encode('utf-8')):
                return {
                    'id': user[0],
                    'nome': user[1],
                    'cargo': user[3]  # Cargo pode ser None se não existir
                }
        return None
    except Exception as e:
        print(f"Erro ao autenticar usuário: {e}")
        return None

def check_user(cpf, email):
    try:
        conn = connect_db()
        if conn:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id FROM usuarios
                WHERE cpf = %s OR email = %s
                """,
                (cpf, email)
            )
            user = cur.fetchone()
            cur.close()
            conn.close()

            if user:
                return {"exists": True, "message": "CPF ou e-mail já cadastrados."}, 200
            return {"exists": False}, 200
    except Exception as e:
        print(f"Erro ao verificar duplicidade de usuário: {e}")
        return {"error": "Erro ao verificar duplicidade no banco de dados."}, 500

def send_verification_email(user_email, user_id):
    try:
        token = generate_verification_token(user_id)
        verification_url = f"http://10.11.1.67:5000/auth/verify?token={token}"

        print(f"🔑 Token gerado para {user_email}: {token}")  # DEBUG
        print(f"📩 Link de ativação enviado: {verification_url}")  # DEBUG

        msg = Message(
            subject="Confirmação de Cadastro",
            recipients=[user_email],
        )
        
        # Definir o corpo do e-mail com UTF-8
        msg.body = f"""Olá! 😊\n\nClique no link para ativar sua conta:\n{verification_url}\n\nEste link expira em 24 horas."""
        msg.charset = "utf-8"

        mail.send(msg)
        print(f"✅ E-mail de verificação enviado para {user_email}")
    
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {e}")