import hashlib

def gerar_hash_md5(senha):
    return hashlib.md5(senha.encode()).hexdigest()

