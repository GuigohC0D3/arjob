from ..entities import users
import json
from ..connection.config import connect_db 
from flask import jsonify, request
from flask_jwt_extended import create_access_token


def register_user(nome=None, cpf=None, email=None, senha=None):
    try:
        # Validar campos obrigatórios
        if not all([nome, cpf, email, senha]):
            return json.dumps({"error": "Todos os campos são obrigatórios."}), 400

        # Criar o usuário no banco (com status "Pendente")
        response, status_code = users.create_user(nome, cpf, email, senha)

        if status_code == 201:
            user_id = response["id"]

        return json.dumps(response), status_code

    except Exception as e:
        print(f"Erro no controlador register_user: {e}")
        return json.dumps({"error": "Erro ao processar o registro de usuário."}), 500

def deletar_usuario(usuario_id):
    try:
        print(f"🛠 Tentando deletar usuário {usuario_id}")  # DEBUG

        response = users.deletar_usuario(usuario_id)

        if "error" in response:
            return jsonify(response), 500

        print(f"✅ Usuário {usuario_id} deletado com sucesso!")  # DEBUG
        return jsonify(response), 200

    except Exception as e:
        print(f"❌ Erro ao deletar usuário: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500


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

def listar_usuarios_status():
    try:
        usuarios_status, status_code = users.get_usuarios_status()
        return usuarios_status, status_code
    except Exception as e:
        print(f"Erro ao listar status dos usuários: {e}")
        return {"error": "Erro ao listar status dos usuários"}, 500


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
    

def atualizar_cargo_usuario(usuario_id):
    try:
        data = request.json
        cargo_id = data.get("cargo_id")

        print(f"🛠 Atualizando cargo para usuário {usuario_id}, novo cargo: {cargo_id}")

        if not cargo_id:
            print("❌ Erro: Cargo não fornecido!")
            return jsonify({"error": "Cargo não fornecido"}), 400

        conn = connect_db()
        cur = conn.cursor()

        cur.execute(
            "UPDATE usuarios SET cargo_id = %s WHERE id = %s",
            (cargo_id, usuario_id)
        )
        conn.commit()
        cur.close()
        conn.close()

        print("✅ Cargo atualizado com sucesso!")
        return jsonify({"message": "Cargo atualizado com sucesso"}), 200

    except Exception as e:
        print(f"❌ Erro ao atualizar cargo do usuário: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500


def atualizar_status_usuario(usuario_id):
    try:
        data = request.json
        novo_status_id = data.get("status_id")  # Agora pegamos "status_id"

        print(f"🔍 Recebido para atualização: Usuário {usuario_id}, Novo Status ID: {novo_status_id}")  # DEBUG

        if not novo_status_id:
            return jsonify({"error": "status_id não fornecido"}), 400

        response = users.atualizar_status(usuario_id, novo_status_id)

        if "error" in response:
            return jsonify(response), 500

        print(f"✅ status_id atualizado com sucesso para {novo_status_id}")  # DEBUG

        return jsonify(response), 200

    except Exception as e:
        print(f"❌ Erro ao atualizar status: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 5


def listar_atendentes():
    try:
        atendentes, status_code = users.listar_atendentes()
        return jsonify(atendentes), status_code
    except Exception as e:
        print(f"Erro ao listar atendentes: {e}")
        return jsonify({"error": "Erro ao listar atendentes"}), 500

def verificar_se_usuario_atendente(usuario_id):
    try:
        return users.verificar_se_usuario_atendente(usuario_id)  # 🔥 Chama a função no `users.py`
    except Exception as e:
        print(f"Erro ao verificar atendente no controlador: {e}")
        return False  # Retorna False se ocorrer um erro

