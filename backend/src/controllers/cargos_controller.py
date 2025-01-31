from flask import jsonify
from ..entities import cargos

def listar_todos_os_cargos():
    try:
        lista_cargos = cargos.buscar_todos()
        return jsonify(lista_cargos)
    except Exception as e:
        print(f"Erro ao buscar cargos: {e}")
        return jsonify({"error": "Erro ao buscar cargos"}), 500
