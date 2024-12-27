from flask import Blueprint, jsonify, request, session, render_template, url_for, redirect, send_from_directory
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import cross_origin, CORS
from math import ceil
from datetime import datetime
from ..controllers import clientes_controller, departamento_cliente_controller, departamentos_controller
from ..entities import comandas
from ..entities import movimentacao_caixa
from ..entities import users
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
    
@main_bp.route('/departamentos', methods=['GET'])
def listar_departamentos():
    """
    Rota para listar todos os departamentos.
    """
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

