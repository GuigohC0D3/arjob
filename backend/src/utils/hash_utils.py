import bcrypt

def hash_password(plain_password):
    # Converte a senha para bytes e gera o hash
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')  # Retorna o hash como string

def verify_password(plain_password, hashed_password):
    # Compara a senha com o hash
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


