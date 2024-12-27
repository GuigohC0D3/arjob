from ..entities import departamentos
import json


def get_departamentos():
    """
    Controlador para obter a lista de departamentos.
    """
    try:
        res = departamentos.listar_departamentos()
        return json.dumps(res["data"]), res["status"]
    except Exception as e:
        print(f"Erro no controlador de departamentos: {e}")
        return json.dumps({"error": "Erro ao processar a solicitação"}), 500
