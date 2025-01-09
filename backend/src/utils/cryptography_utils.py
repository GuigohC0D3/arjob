from cryptography.fernet import Fernet

# Gere uma chave e salve-a de forma segura
key = Fernet.generate_key()
cipher_suite = Fernet(key)

def encrypt_data(plain_data):
    return cipher_suite.encrypt(plain_data.encode('utf-8')).decode('utf-8')

def decrypt_data(encrypted_data):
    return cipher_suite.decrypt(encrypted_data.encode('utf-8')).decode('utf-8')
