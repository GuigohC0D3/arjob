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
    """Endpoint para atualizar o status de uma mesa."""

    data = request.json
    status = data.get("status")

    # 🔥 Se `status` for `None`, retorna erro
    if status is None:
        return jsonify({"error": "Status deve ser um booleano (true ou false)"}), 400

    # 🔥 Garante que status seja booleano
    status = bool(status)

    atualizado = mesas.atualizar_status_mesa(mesa_id, status)

    if atualizado:
        return jsonify({"message": "Status da mesa atualizado com sucesso"}), 200
    return jsonify({"error": "Erro ao atualizar status da mesa"}), 500

def excluir_mesa(mesa_id):
    excluido = mesas.excluir_mesa(mesa_id)
    if excluido:
        return jsonify({"message": "Mesa excluída com sucesso"}), 200
    return jsonify({"error": "Erro ao excluir mesa"}), 500

def adicionar_mesas():
    """Adiciona múltiplas mesas dinamicamente"""
    data = request.json
    quantidade = data.get("quantidade")

    if not isinstance(quantidade, int) or quantidade <= 0:
        return jsonify({"error": "Quantidade inválida"}), 400

    resultado = mesas.adicionar_mesas(quantidade)

    if resultado:
        return jsonify({"message": f"{quantidade} mesas adicionadas com sucesso"}), 201
    return jsonify({"error": "Erro ao adicionar mesas"}), 500

def remover_ultima_mesa():
    resultado = mesas.excluir_ultima_mesa()
    if resultado:
        return jsonify({"message": "Última mesa removida com sucesso"}), 200
    return jsonify({"error": "Erro ao remover última mesa"}), 500
