from flask import jsonify, request
from ..entities import mesas

def listar_mesas():
    resultado = mesas.listar_mesas()
    if resultado is not None:
        return jsonify(resultado), 200
    return jsonify({"error": "Erro ao listar mesas"}), 500

def criar_mesa():
    data = request.json
    numero = data.get("numero")
    if not numero:
        return jsonify({"error": "Número da mesa é obrigatório"}), 400

    mesa_id = mesas.criar_mesa(numero)
    if mesa_id:
        return jsonify({"message": "Mesa criada com sucesso", "id": mesa_id}), 201
    return jsonify({"error": "Erro ao criar mesa"}), 500

def atualizar_status_mesa(mesa_id):
    data = request.json
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status é obrigatório"}), 400

    atualizado = mesas.atualizar_status_mesa(mesa_id, status)
    if atualizado:
        return jsonify({"message": "Status da mesa atualizado com sucesso"}), 200
    return jsonify({"error": "Erro ao atualizar status da mesa"}), 500

def excluir_mesa(mesa_id):
    excluido = mesas.excluir_mesa(mesa_id)
    if excluido:
        return jsonify({"message": "Mesa excluída com sucesso"}), 200
    return jsonify({"error": "Erro ao excluir mesa"}), 500
