from ..entities import permissoes

def atualizar_permissoes_usuario(usuario_id, permissoes_lista):
    try:
        permissoes.atualizar_permissoes_usuario(usuario_id, permissoes_lista)
        return {"message": "Permissões atualizadas com sucesso"}, 200
    except Exception as e:
        print(f"Erro ao atualizar permissões: {e}")
        return {"error": "Erro ao atualizar permissões"}, 500
