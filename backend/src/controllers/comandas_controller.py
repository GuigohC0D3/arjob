from flask import jsonify, request
from ..entities import comandas, mesas
from ..entities.comandas import atualizar_status_comanda

def abrir_comanda(mesa_id, numero_comanda=None):
    try:
        # Verificar se já existe uma comanda ativa para a mesa
        comanda_existente = comandas.obter_comanda_por_mesa(mesa_id)
        if comanda_existente:
            return True, comanda_existente["numero"]

        # Criar nova comanda se não existir nenhuma ativa
        sucesso = comandas.criar_comanda(mesa_id, numero_comanda)
        if sucesso:
            mesas.atualizar_status_mesa(mesa_id, "ocupada")
            return True, numero_comanda
        else:
            return False, "Erro ao criar comanda no banco de dados"
    except Exception as e:
        print(f"Erro ao abrir comanda: {e}")
        return False, "Erro interno no servidor"

def criar_comanda():
    """
    Endpoint para criar uma nova comanda.
    """
    try:
        dados = request.json
        mesa_id = dados.get("mesa_id")
        if not mesa_id:
            return jsonify({"error": "Mesa ID não fornecido"}), 400

        numero_comanda = comandas.gerar_numero_comanda()
        status, mensagem = abrir_comanda(mesa_id, numero_comanda)

        if status:
            return jsonify({"numero": numero_comanda}), 201
        else:
            return jsonify({"error": mensagem}), 400
    except Exception as e:
        print(f"Erro ao criar comanda: {e}")
        return jsonify({"error": "Erro ao criar comanda"}), 500
    
def fechar_comanda(comanda_id):
    try:
        # Chama a entidade para realizar a operação no banco
        response, status_code = atualizar_status_comanda(comanda_id)
        
        # Certifica-se de retornar apenas dicionários e status
        if isinstance(response, dict):
            return response, status_code
        else:
            print("Resposta inesperada do banco de dados:", response)
            return {"error": "Erro inesperado no servidor"}, 500
    except Exception as e:
        print(f"Erro no controlador fechar_comanda: {e}")
        return {"error": "Erro interno no controlador"}, 500
    
def listar_comandas():
    resultado = comandas.listar_comandas()
    if resultado is not None:
        return jsonify(resultado), 200
    return jsonify({"error": "Erro ao listar comandas"}), 500
