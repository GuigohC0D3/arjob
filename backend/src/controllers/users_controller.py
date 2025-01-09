from ..entities import users
import json

def add_usuarios(nome=None, email=None, cpf=None, senha_hash=None, cargos=None):
    try:
        # Validação básica dos campos obrigatórios
        if not nome or not cpf or not cargos:
            return json.dumps({'error': 'Campos obrigatórios: nome, cpf e cargos'}), 400

        # Chamar a entidade que processa o cadastro
        res = users.add_cliente(nome, email, cpf, senha_hash, cargos)
        return json.dumps(res), res['status']
    except Exception as e:
        print("Erro no controlador add_client:", e)
        return json.dumps({"error": "Erro ao processar o cliente"}), 500