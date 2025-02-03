from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from ..entities import cargos

def listar_todos_os_cargos():
    identidade = get_jwt_identity()
    print(f"Usuário autenticado: {identidade}")  # 🔍 Para verificar se o token está correto

    if not identidade:
        return jsonify({"error": "Token inválido"}), 401

    try:
        lista_cargos = cargos.buscar_todos()
        if not lista_cargos:
            return jsonify({"error": "Nenhum cargo encontrado"}), 404

        return jsonify(lista_cargos), 200
    except Exception as e:
        print(f"Erro ao buscar cargos: {e}")
        return jsonify({"error": "Erro ao buscar cargos"}), 500
