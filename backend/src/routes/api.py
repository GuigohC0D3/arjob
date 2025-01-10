from flask import Blueprint, jsonify, request, session, render_template, url_for, redirect, send_from_directory
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import cross_origin, CORS
from math import ceil
from datetime import datetime
from ..controllers import clientes_controller, departamento_cliente_controller, departamentos_controller,  mesas_controller, comandas_controller, produtos_controller, buscar_produtos_controller, users_controller
from ..entities import comandas
from ..entities.clientes import get_clientes 
from ..entities import movimentacao_caixa
# from ..entities.users import corrigir_senhas, corrigir_cpfs
from ..connection.config import connect_db 
import os
main_bp = Blueprint('main', __name__)
main_bp.secret_key = 'b2d79f7202d194fc6de942abc1297eeb44d5f4e5'

login_manager = LoginManager()
login_manager.init_app(main_bp)
login_manager.login_view = 'login'  # Redireciona para a rota de login quando não autenticado

CORS(main_bp, methods=['GET', 'POST', 'DELETE', 'PUT'])

@main_bp.route('/clientes', methods=['POST'])
def addCliente():
    try:
        print("Dados recebidos no backend:", request.json)  # Log dos dados recebidos
        return clientes_controller.add_client(**request.json)
    except Exception as e:
        print("Erro no endpoint /clientes:", e)  # Log do erro no terminal
        return jsonify({"error": "Erro interno no servidor"}), 500
    
@main_bp.route('/clientes', methods=['GET'])
def get_clientes_endpoint():
    try:
        result, status_code = get_clientes()
        return jsonify(result), status_code
    except Exception as e:
        print(f"Erro no endpoint /clientes: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route('/clientes/<cpf>', methods=['GET'])
def get_cliente_por_cpf(cpf):
    try:
        cliente, status_code = clientes_controller.buscar_cliente_por_cpf(cpf)
        return jsonify(cliente), status_code
    except Exception as e:
        print(f"Erro no endpoint /clientes/{cpf}: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500


@main_bp.route('/departamentos', methods=['GET'])
def listar_departamentos():
    try:
        return departamentos_controller.get_departamentos()
    except Exception as e:
        print(f"Erro no endpoint /departamentos: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route('/departamento_cliente', methods=['GET'])
def listar_departamento_cliente():
    return departamento_cliente_controller.listar_departamento_cliente()

@main_bp.route('/departamento_cliente', methods=['POST'])
def adicionar_departamento_cliente():
    data = request.json
    cliente_id = data.get('cliente_id')
    departamento_id = data.get('departamento_id')
    return departamento_cliente_controller.adicionar_departamento_cliente(cliente_id, departamento_id)

@main_bp.route("/mesas", methods=["GET"])
def listar_main():
    return mesas_controller.listar_mesas()

@main_bp.route("/mesas_post", methods=["POST"])
def criar_mesa():
    return mesas_controller.criar_mesa()

@main_bp.route("/mesas/<int:mesa_id>/status", methods=["PUT"])
def atualizar_status_mesa(mesa_id):
    return mesas_controller.atualizar_status_mesa(mesa_id)

@main_bp.route('/mesas/<int:id>', methods=['GET'])
def get_mesa(id):
    # Substitua pela lógica para buscar a mesa pelo ID
    mesa = {"id": id, "numero": 2, "status": "disponível"}
    return jsonify(mesa), 200


@main_bp.route("/mesas/<int:mesa_id>", methods=["DELETE"])
def excluir_mesa(mesa_id):
    return mesas_controller.excluir_mesa(mesa_id)


@main_bp.route("/comandas", methods=["POST"])
def criar_comanda():
    return comandas_controller.criar_comanda()

@main_bp.route('/comandas/<int:comanda_id>/fechar', methods=['PUT'])
def fechar_comanda(comanda_id):
    try:
        # Chama o controlador para fechar a comanda
        response, status_code = comandas_controller.fechar_comanda(comanda_id)
        
        # Retorna um JSON serializável
        if isinstance(response, dict):
            return jsonify(response), status_code
        else:
            return jsonify({"error": "Resposta inesperada do servidor"}), 500
    except Exception as e:
        print(f"Erro no endpoint /comandas/{comanda_id}/fechar: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route("/comandas", methods=["GET"])
def listar_comandas():
    return comandas_controller.listar_comandas()

@main_bp.route("/produtos", methods=["GET"])
def listar_produtos():
    produtos, status = produtos_controller.get_produtos()
    return jsonify(produtos), status

@main_bp.route("/produtos/buscar", methods=["GET"])
def buscar_produtos_route():
    return buscar_produtos_controller.buscar_produtos()


@main_bp.route('/users', methods=['POST'])
def register_user():
    try:
        return users_controller.register_user(**request.json)
    except Exception as e:
        print("Erro no endpoint /users:", e)
        return jsonify({"error": "Erro interno no servidor"}), 500
    
@main_bp.route('/login', methods=['POST'])
def login_user():
    """
    Endpoint para autenticar um usuário.
    """
    try:
        data = request.json
        cpf = data.get('cpf')
        senha = data.get('senha')

        if not cpf or not senha:
            return jsonify({'error': 'CPF e senha são obrigatórios'}), 400

        # Chama o controlador para autenticar o usuário
        from ..controllers import users_controller
        response, status_code = users_controller.authenticate_user(cpf, senha)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Erro no endpoint /login: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500


# @main_bp.route('/corrigir-senhas', methods=['POST'])
# def corrigir_senhas_route():
#     corrigir_senhas()
#     return {"message": "Senhas corrigidas com sucesso"}, 200

# @main_bp.route('/corrigir-cpf', methods=['POST'])
# def corrigir_cpf_route():
#     corrigir_cpfs()
#     return {"message": "CPFS corrigidos com sucesso"}, 200