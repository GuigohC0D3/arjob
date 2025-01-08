import bcrypt

def hash_password(plain_password):
    """
    Gera o hash da senha usando bcrypt.
    :param plain_password: A senha original em texto plano.
    :return: Hash seguro da senha.
    """
    # Converte a senha para bytes e gera o hash
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')  # Retorna o hash como string

def verify_password(plain_password, hashed_password):
    """
    Compara a senha em texto plano com o hash armazenado.
    :param plain_password: A senha original em texto plano.
    :param hashed_password: O hash da senha armazenado.
    :return: True se as senhas correspondem, False caso contrário.
    """ 
    # Compara a senha com o hash
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
