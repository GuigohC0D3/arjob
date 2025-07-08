from flask import jsonify
from ..entities import relatorios

def listar_relatorios():
    resultado = relatorios.listar_relatorios()
    if resultado is not None:
        return jsonify(resultado), 200
    return jsonify({"error": "Erro ao gerar relatório"}), 500

def listar_consumos_cliente_mes(cpf, mes, ano):
    resultado, status = relatorios.listar_consumos_cliente_mes(cpf, mes, ano)
    return jsonify(resultado), status
