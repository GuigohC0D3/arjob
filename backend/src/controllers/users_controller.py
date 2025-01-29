from ..entities import users
import json

def register_user(nome=None, cpf=None, email=None, senha=None):
    try:
        # Validar campos obrigatórios
        if not all([nome, cpf, email, senha]):
            return json.dumps({"error": "Todos os campos são obrigatórios."}), 400

        # Criar o usuário no banco (com status "Pendente")
        response, status_code = users.create_user(nome, cpf, email, senha)

        if status_code == 201:
            user_id = response["id"]


            # Enviar e-mail de verificação
            users.send_verification_email(email)

        return json.dumps(response), status_code

    except Exception as e:
        print(f"Erro no controlador register_user: {e}")
        return json.dumps({"error": "Erro ao processar o registro de usuário."}), 500



def authenticate_user(cpf, senha):
    try:
        user = users.get_user_by_cpf_and_password(cpf, senha)
        if not user:
            return {"error": "CPF ou senha inválidos"}, 401

        # Buscar permissões do usuário
        permissoes = users.get_user_permissions(user["id"])
        if permissoes is None:
            return {"error": "Erro ao buscar permissões do usuário"}, 500

        return {
            "message": "Login bem-sucedido",
            "user": {
                "id": user["id"],
                "nome": user["nome"],
                "cpf": user["cpf"],
                "email": user["email"],
                "cargo": user["cargo"],
                "permissoes": permissoes,
            },
        }, 200
    except Exception as e:
        print(f"Erro no controlador authenticate_user: {e}")
        return {"error": "Erro ao processar autenticação"}, 500



def listar_usuarios():
    try:
        # Buscar a lista de usuá    rios na entidade
        usuarios_lista = users.listar_usuarios()
        return json.dumps(usuarios_lista), 200
    except Exception as e:
        print(f"Erro no controlador listar_usuarios: {e}")
        return json.dumps({"error": "Erro ao listar usuários"}), 500


def listar_usuarios_com_permissoes():
    try:
        usuarios = users.listar_usuarios_com_permissoes()
        return usuarios, 200
    except Exception as e:
        print(f"Erro ao listar usuários com permissões: {e}")
        return {"error": "Erro ao listar usuários"}, 500

def get_user_permissions(user_id):
    try:
        permissoes = users.get_user_permissions(user_id)  # Chama a função da entidade
        return {"permissoes": permissoes}, 200
    except Exception as e:
        print(f"Erro ao buscar permissões do usuário: {e}")
        return {"error": "Erro ao buscar permissões"}, 500

def check_user(cpf, email):
    try:
        # Verificar duplicidade de CPF ou e-mail
        response, status_code = users.check_user(cpf, email)
        return response, status_code
    except Exception as e:
        print(f"Erro no controlador check_user: {e}")
        return {"error": "Erro ao verificar duplicidade."}, 500