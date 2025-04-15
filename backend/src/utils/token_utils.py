from itsdangerous import URLSafeTimedSerializer
import psycopg2
from flask import jsonify
from ..connection.config import connect_db 
from datetime import timedelta, datetime
from flask_jwt_extended import decode_token, create_access_token

# Chaves de segurança
SECRET_KEY = "sua_chave_secreta"
SECURITY_PASSWORD_SALT = "seu_salt_secreto"

# 🔐 Token de verificação por e-mail (não-JWT)
def generate_token(email):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.dumps(email, salt=SECURITY_PASSWORD_SALT)

def verify_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    try:
        email = serializer.loads(token, salt=SECURITY_PASSWORD_SALT, max_age=expiration)
        return email
    except Exception as e:
        print(f"Erro ao verificar token por e-mail: {e}")
        return None

# 🔐 Logout de refresh token (se você estiver usando refresh tokens)
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

# ✅ Gerar token JWT de verificação ou login
def generate_verification_token(user_id):
    return create_access_token(identity=user_id, expires_delta=timedelta(days=7), algorithm="HS256")

# ✅ Verificar token JWT (usado em rotas protegidas)
def verify_jwt_token(token):
    try:
        print(f"📩 Token JWT recebido: {token}")
        decoded_token = decode_token(token)
        print(f"✅ Token JWT decodificado com sucesso: {decoded_token}")
        return decoded_token["sub"]
    except Exception as e:
        print(f"❌ Erro ao decodificar token JWT: {e}")
        return None
