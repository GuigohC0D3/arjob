from flask import Blueprint, jsonify, request, session, render_template, url_for, redirect, send_from_directory
from flask_login import UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import cross_origin, CORS
from math import ceil
from datetime import datetime
from ..controllers import dashboard_controller
from ..controllers import clientes_controller, departamento_cliente_controller, departamentos_controller,  mesas_controller, comandas_controller, produtos_controller, buscar_produtos_controller, users_controller, permissoes_controller, cargos_controller
from ..entities import comandas
from ..classes.user import User
from ..entities.users import authenticate_user, get_user_permissions, get_user_cargo, send_verification_email
from ..entities.clientes import get_clientes 
from flask_mail import Message
from src.extensions import mail
from itsdangerous import URLSafeTimedSerializer
from src.utils.token_utils import generate_token, verify_token  # Importa utilitários de token
from datetime import timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from ..entities import movimentacao_caixa
# from ..entities.users import corrigir_senhas
from ..connection.config import connect_db 
import os
main_bp = Blueprint('main', __name__)
#main_bp.secret_key = 'b2d79f7202d194fc6de942abc1297eeb44d5f4e5'



CORS(main_bp, methods=['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'])

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
        # Valide o formato do CPF
        if len(cpf) != 14 or not cpf.replace(".", "").replace("-", "").isdigit():
            return jsonify({"error": "Formato de CPF inválido"}), 400

        print(f"CPF recebido no backend: {cpf}")
        
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


@main_bp.route('/comandas', methods=['POST'])
def criar_comanda():
    try:
        dados = request.json
        mesa_id = dados.get("mesa_id")
        cliente_cpf = dados.get("cliente_cpf")

        if not mesa_id or not cliente_cpf:
            return jsonify({"error": "Dados insuficientes para criar a comanda"}), 400

        # Chama o controller para processar a criação
        response, status_code = comandas_controller.abrir_comanda(mesa_id, cliente_cpf)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Erro no endpoint /comandas: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route('/comandas/<string:code>/fechar', methods=['PUT'])
@cross_origin(origins="http://localhost:5173")
def fechar_comanda(code):
    try:
        dados = request.get_json(silent=True)  # 🔥 Garantir que está recebendo JSON válido

        # 🔍 Debug: Exibir os dados recebidos
        print(f"🔹 Dados recebidos na requisição: {dados}")

        if not dados:
            return jsonify({"error": "Nenhum JSON foi enviado"}), 400

        return comandas_controller.fechar_comanda(code)
    except Exception as e:
        print(f"Erro ao fechar comanda pelo código: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
    
@main_bp.route('/comandas/mesa/<int:mesa_id>', methods=['GET'])
def obter_comanda_por_mesa(mesa_id):
    try:
        comanda = comandas.obter_comanda_por_mesa(mesa_id)
        if comanda:
            return jsonify(comanda), 200
        else:
            return jsonify({"error": "Nenhuma comanda aberta encontrada para esta mesa"}), 404
    except Exception as e:
        print(f"Erro ao obter comanda por mesa: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500


@main_bp.route("/comandas/fechadas", methods=["GET"])
def listar_comandas_fechadas():
    try:
        comandas_fechadas = comandas.listar_comandas_fechadas()
        return jsonify(comandas_fechadas), 200
    except Exception as e:
        print(f"Erro no endpoint /comandas/fechadas: {e}")
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
    
@main_bp.route('/cargos', methods=['GET'])
def listar_cargos():
    try:
        from ..entities.cargos import listar_cargos
        cargos = listar_cargos()
        return jsonify(cargos), 200
    except Exception as e:
        print(f"Erro ao listar cargos: {e}")
        return jsonify({"error": "Erro ao listar cargos"}), 500

    
@main_bp.route('/login', methods=['POST'])
def login_user_route():
    try:
        data = request.json
        cpf = data.get('cpf')
        senha = data.get('senha')

        if not cpf or not senha:
            return jsonify({'error': 'CPF e senha são obrigatórios'}), 400

        user_data = authenticate_user(cpf, senha)
        if user_data:
            access_token = create_access_token(identity=str(user_data['id']))
            return jsonify({
                'token': access_token,
                'user': {
                    'id': user_data['id'],
                    'nome': user_data['nome'],
                    'cargo': user_data['cargo']
                },
                'permissions': get_user_permissions(user_data['id'])
            }), 200
        else:
            return jsonify({'error': 'Usuário ou senha inválidos'}), 401
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500



# @main_bp.route('/corrigir-senhas', methods=['POST'])
# def corrigir_senhas_route():
#     corrigir_senhas()
#     return {"message": "Senhas corrigidas com sucesso"}, 200

# @main_bp.route('/corrigir-cpf', methods=['POST'])
# def corrigir_cpf_route():
#     corrigir_cpfs()
#     return {"message": "CPFS corrigidos com sucesso"}, 200

# Listar usuários com permissões
@main_bp.route('/admin/usuarios', methods=['GET'])
def listar_usuarios_com_permissoes():
    try:
        usuarios, status_code = users_controller.listar_usuarios_com_permissoes()
        return jsonify(usuarios), status_code
    except Exception as e:
        print(f"Erro no endpoint /admin/usuarios: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route('/admin/usuarios/<int:usuario_id>', methods=['DELETE'])
@jwt_required()
def deletar_usuario(usuario_id):
    return users_controller.deletar_usuario(usuario_id)


@main_bp.route('/admin/usuarios/status', methods=['GET'])
def listar_status_usuarios():
    try:
        usuarios_status, status_code = users_controller.listar_usuarios_status()
        return jsonify(usuarios_status), status_code
    except Exception as e:
        print(f"Erro no endpoint /admin/usuarios/status: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

# Atualizar permissões de um usuário
@main_bp.route('/admin/usuarios/<int:usuario_id>/permissoes', methods=['PUT'])
def atualizar_permissoes_usuario(usuario_id):
    try:
        permissoes = request.json.get("permissoes")
        if not permissoes:
            return jsonify({"error": "Nenhuma permissão fornecida"}), 400
        
        response, status_code = permissoes_controller.atualizar_permissoes_usuario(usuario_id, permissoes)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Erro no endpoint /admin/usuarios/{usuario_id}/permissoes: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route('/admin/permissoes', methods=['GET'])
def listar_permissoes_disponiveis():
    try:
        permissoes = [
            "iniciar_venda",
            "historico",
            "gerenciar_clientes",
            "produtos",
            "suporte",
            "painel_admin",
        ]  # Substitua isso com a busca no banco de dados.
        return jsonify(permissoes), 200
    except Exception as e:
        print(f"Erro ao listar permissões: {e}")
        return jsonify({"error": "Erro ao listar permissões"}), 500

# Listar clientes
@main_bp.route('/admin/clientes', methods=['GET'])
def listar_clientes_painel():
    try:
        clientes, status_code = clientes_controller.listar_clientes()
        return jsonify(clientes), status_code
    except Exception as e:
        print(f"Erro no endpoint /admin/clientes: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

# Remover cliente
@main_bp.route('/admin/clientes/<int:cliente_id>', methods=['DELETE'])
def remover_cliente_painel(cliente_id):
    try:
        response, status_code = clientes_controller.remover_cliente(cliente_id)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Erro no endpoint /admin/clientes/{cliente_id}: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route('/admin/dashboard', methods=['GET'])
def dashboard():
    data = dashboard_controller.get_dashboard_data()
    if data:
        return jsonify(data), 200
    return jsonify({"error": "Erro ao carregar dashboard"}), 50

@main_bp.route('/admin/cargos', methods=['GET'])
@jwt_required()
def listar_cargos_admin():
    identidade = get_jwt_identity()
    print(f"🔹 Usuário autenticado (Token JWT): {identidade}")
    if not identidade:
        return jsonify({"msg": "Token Inválido ou Não reconhecido"}), 401
    
    return cargos_controller.listar_todos_os_cargos()

@main_bp.route('/users/check', methods=['POST'])
def check_user():
    try:
        data = request.json
        cpf = data.get('cpf')
        email = data.get('email')

        if not cpf or not email:
            return jsonify({"error": "CPF e e-mail são obrigatórios."}), 400

        response, status_code = users_controller.check_user(cpf, email)
        return jsonify(response), status_code
    except Exception as e:
        print(f"Erro no endpoint /users/check: {e}")
        return jsonify({"error": "Erro interno no servidor."}), 500


@main_bp.route('/auth/cargo', methods=['OPTIONS'])
def cors_preflight():
    response = jsonify({"message": "Preflight request handled"})
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200

@main_bp.route('/auth/cargo', methods=['GET'])
@jwt_required()
def obter_cargo_usuario():
    try:
        user_id = get_jwt_identity()
        cargo = get_user_cargo(user_id)
        if cargo:
            return jsonify({"cargo": cargo}), 200
        else:
            return jsonify({"error": "Cargo não encontrado"}), 404
    except Exception as e:
        print(f"Erro ao obter cargo do usuário: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route('/permissoes', methods=['OPTIONS'])
def permissoes_preflight():
    response = jsonify({"message": "Preflight request handled"})
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response, 200

@main_bp.route('/permissoes', methods=['GET'])
@jwt_required()
def listar_permissoes_usuario():
    try:
        user_id = get_jwt_identity()  # Obtém o ID do usuário a partir do token
        permissoes = get_user_permissions(user_id)
        return jsonify({"permissoes": permissoes}), 200
    except Exception as e:
        print(f"Erro ao buscar permissões: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

@main_bp.route("/enviar-token", methods=["POST"])
def enviar_token():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "E-mail é obrigatório"}), 400

    # Gere um token JWT com expiração curta
    token = create_access_token(identity=email, expires_delta=timedelta(minutes=10))

    # Envie o token por e-mail
    try:
        msg = Message(
            subject="Seu Token de Acesso",
            recipients=[email],
            body=f"Seu token de acesso é: {token}\n\nEste token expira em 10 minutos.",
        )
        mail.send(msg)
        return jsonify({"message": "Token enviado com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return jsonify({"error": "Erro ao enviar e-mail"}), 500

# Exemplo de rota para verificar token
@main_bp.route("/verificar-token", methods=["POST"])
def verificar_token_route():
    data = request.json
    token = data.get("token")

    if not token:
        return jsonify({"error": "Token é obrigatório"}), 400

    # Verificar o token
    email = verify_token(token)

    if email:
        return jsonify({"message": "Token válido!", "email": email}), 200
    else:
        return jsonify({"error": "Token inválido ou expirado"}), 400

@main_bp.route('/auth/verify', methods=['GET'])
def verify_email():
    token = request.args.get("token")

    if not token:
        return jsonify({"error": "Token inválido"}), 400

    try:
        user_email = verify_token(token)  # Agora retorna o e-mail

        if not user_email:
            return jsonify({"error": "Token inválido ou expirado"}), 400

        # Atualizar usuário para "Ativo" pelo e-mail
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("UPDATE usuarios SET status_id = 1 WHERE email = %s", (user_email,))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Conta ativada com sucesso! Você já pode fazer login."}), 200

    except Exception as e:
        print(f"❌ Erro ao ativar conta: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500


@main_bp.route('/send-confirmation-email', methods=['POST'])
def send_confirmation_email():
    try:
        data = request.json
        email = data.get("email")

        if not email:
            return jsonify({"error": "E-mail é obrigatório"}), 400

        # Enviar e-mail de confirmação sem precisar do ID
        send_verification_email(email)  

        return jsonify({"message": "E-mail enviado com sucesso!"}), 200
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {e}")
        return jsonify({"error": "Erro ao enviar e-mail"}), 500

@main_bp.route('/admin/usuarios/<int:usuario_id>/cargo', methods=['PUT'])
@jwt_required()
def atualizar_cargo(usuario_id):
    try:
        return users_controller.atualizar_cargo_usuario(usuario_id)
    except Exception as e:
        print(f"Erro ao atualizar cargo do usuário: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
    
@main_bp.route('/admin/usuarios/<int:usuario_id>/status', methods=['PUT'])
@jwt_required()
def atualizar_status(usuario_id):
    return users_controller.atualizar_status_usuario(usuario_id)