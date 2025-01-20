from itsdangerous import URLSafeTimedSerializer

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
