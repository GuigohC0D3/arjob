from flask import jsonify, request
from ..entities.buscar_produtos import buscar_produtos_db

def buscar_produtos():
    try:
        query = request.args.get("query", "")  # Obter o texto de busca
        filtro = request.args.get("filtro", None)  # Obter o filtro, se houver

        # Buscar produtos com os parâmetros fornecidos
        produtos = buscar_produtos_db(query, filtro)
        return jsonify({"data": produtos, "status": 200}), 200
    except Exception as e:
        print(f"Erro no controller buscar_produtos: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
