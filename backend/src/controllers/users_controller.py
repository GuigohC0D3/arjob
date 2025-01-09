from ..entities import users
import json

def register_user(nome=None, cpf=None, email=None, senha=None, cargo=None):
    """
    Processa os dados para registrar um novo usuário.
    """
    try:
        # Validação básica dos campos obrigatórios
        if not nome or not cpf or not email or not senha or not cargo:
            print("Dados inválidos recebidos.")
            return json.dumps({'error': 'Todos os campos são obrigatórios.'}), 400

        # Chamar a entidade para criar o usuário
        res = users.create_user(nome, cpf, email, senha, cargo)
        return json.dumps(res), res['status']
    except Exception as e:
        print(f"Erro no controlador register_user: {e}")
        return json.dumps({"error": "Erro ao processar o registro de usuário"}), 500


from ..entities import users
import json

def authenticate_user(cpf, senha):
    try:
        # Verifica se o usuário existe no banco
        user = users.get_user_by_cpf_and_password(cpf, senha)
        if not user:
            return {'error': 'CPF ou senha inválidos'}, 401

        # Retorna informações do usuário (sem expor a senha)
        return {
            'message': 'Login bem-sucedido',
            'user': {
                'id': user['id'],
                'nome': user['nome'],
                'cpf': user['cpf'],
                'email': user['email'],
                'cargo': user['cargo'],
            }
        }, 200
    except Exception as e:
        print(f"Erro no controlador authenticate_user: {e}")
        return {'error': 'Erro ao processar autenticação'}, 500
