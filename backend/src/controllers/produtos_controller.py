from ..entities import produtos

def get_produtos():
    produtos_listados = produtos.listar_produtos()
    if produtos_listados is not None:
        return produtos_listados, 200
    else:
        return {"error": "Erro ao listar produtos"}, 500


