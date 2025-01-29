from itsdangerous import URLSafeTimedSerializer
import psycopg2
from flask import jsonify
from ..connection.config import connect_db 
from datetime import timedelta
from flask_jwt_extended import decode_token, create_access_token

SECRET_KEY = "sua_chave_secreta"
SECURITY_PASSWORD_SALT = "seu_salt_secreto"

def generate_token(email):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.dumps(email, salt=SECURITY_PASSWORD_SALT)

def verify_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    try:
        email = serializer.loads(token, salt=SECURITY_PASSWORD_SALT, max_age=expiration)
        return email
    except Exception as e:
        print(f"Erro ao verificar token: {e}")
        return None

def logout_refresh_token(refresh_token):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO refresh_token_blacklist (token, expira_em)
                VALUES (%s, %s)
            """, (refresh_token, datetime.now() + timedelta(hours=8)))
            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Erro ao invalidar token: {e}")
            return False

def generate_verification_token(user_id):
    return create_access_token(identity=user_id, expires_delta=timedelta(days=7), algorithm="HS256")

def verify_token(token):
    try:
        print(f"📩 Token recebido para verificação: {token}")  # DEBUG

        decoded_token = decode_token(token)  # Decodifica o token
        print(f"✅ Token decodificado com sucesso: {decoded_token}")  # DEBUG

        return decoded_token["sub"]  # Retorna o email, não o ID
    except Exception as e:
        print(f"❌ Erro ao decodificar token: {e}")
        return None