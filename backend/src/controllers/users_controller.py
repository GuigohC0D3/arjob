from ..entities import users
from ..connection.config import connect_db
import json

def register_user(nome=None, cpf=None, email=None, senha=None, cargoId=None):
    try:
        # Validar campos obrigatórios
        if not all([nome, cpf, email, senha, cargoId]):
            return json.dumps({"error": "Todos os campos são obrigatórios."}), 400

        # Usar o cargoId diretamente
        response, status_code = users.create_user(nome, cpf, email, senha, cargoId)

        # Verificar se o cargo é "usuario" para atribuir permissões padrão
        if status_code == 201:
            # Buscar o nome do cargo associado
            conn = connect_db()
            cur = conn.cursor()
            cur.execute("SELECT nome FROM cargos WHERE id = %s", (cargoId,))
            cargo_nome = cur.fetchone()
            cur.close()
            conn.close()

            if cargo_nome and cargo_nome[0].lower() == "usuario":
                permissoes_padrao = ["iniciar_venda", "historico", "produtos"]
                users.definir_permissoes(response["id"], permissoes_padrao)

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
        # Buscar a lista de usuários na entidade
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
