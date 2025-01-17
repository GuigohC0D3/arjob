from ..entities import permissoes
from ..entities.permissoes import listar_permissoes_usuario as listar_permissoes_entitie


def atualizar_permissoes_usuario(usuario_id, permissoes_lista):
    try:
        permissoes.atualizar_permissoes_usuario(usuario_id, permissoes_lista)
        return {"message": "Permissões atualizadas com sucesso"}, 200
    except Exception as e:
        print(f"Erro ao atualizar permissões: {e}")
        return {"error": "Erro ao atualizar permissões"}, 500
def listar_permissoes_usuario(usuario_id):
    try:
        permissoes = listar_permissoes_entitie(usuario_id)  # Chamada correta para a entidade
        return {"permissoes": permissoes}, 200
    except Exception as e:
        print(f"Erro no controlador ao listar permissões do usuário {usuario_id}: {e}")
        return {"error": "Erro ao listar permissões"}, 500