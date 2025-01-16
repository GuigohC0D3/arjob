from ..entities import users
from ..connection.config import connect_db
import json

def register_user(nome=None, cpf=None, email=None, senha=None, cargo=None):
    try:
        # Validar campos obrigatórios
        if not all([nome, cpf, email, senha, cargo]):
            return json.dumps({"error": "Todos os campos são obrigatórios."}), 400

        # Buscar o ID do cargo pelo nome
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("SELECT id FROM cargos WHERE nome = %s", (cargo,))
        cargo_row = cur.fetchone()
        cur.close()
        conn.close()

        if not cargo_row:
            return json.dumps({"error": "Cargo não encontrado."}), 400

        cargo_id = cargo_row[0]  # ID do cargo encontrado

        # Chamar a entidade para criar o usuário
        response, status_code = users.create_user(nome, cpf, email, senha, cargo_id)
        return json.dumps(response), status_code
    except Exception as e:
        print(f"Erro no controlador register_user: {e}")
        return json.dumps({"error": "Erro ao processar o registro de usuário."}), 500


def authenticate_user(cpf, senha):
    try:
        user = users.get_user_by_cpf_and_password(cpf, senha)
        if not user:
            return {"error": "CPF ou senha inválidos"}, 401

        # Buscar o cargo do usuário
        cargo = users.get_user_cargo(user["id"])
        if not cargo:
            return {"error": "Cargo do usuário não encontrado"}, 404

        return {
            "message": "Login bem-sucedido",
            "user": {
                "id": user["id"],
                "nome": user["nome"],
                "cpf": user["cpf"],
                "email": user["email"],
                "cargo": cargo,
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
