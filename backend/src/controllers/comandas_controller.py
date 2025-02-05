from flask import jsonify, request
from ..entities import comandas, mesas, clientes
from ..entities.comandas import atualizar_status_comanda

def abrir_comanda(mesa_id, cliente_cpf):
    """
    Lógica para abrir uma comanda, associando cliente e mesa.
    """
    try:
        # Busca o cliente pelo CPF
        cliente, status_code = clientes.buscar_cliente_por_cpf(cliente_cpf)
        if status_code != 200:
            return cliente, status_code

        cliente_id = cliente.get("id")

        # Verifica se já existe uma comanda ativa na mesa
        comanda_existente = comandas.obter_comanda_por_mesa(mesa_id)
        if comanda_existente:
            return {"error": "Já existe uma comanda ativa para esta mesa."}, 400

        # Cria uma nova comanda com o cliente_id
        return comandas.criar_comanda(mesa_id, cliente_id)
    except Exception as e:
        print(f"Erro ao abrir comanda no controlador: {e}")
        return {"error": "Erro interno no servidor"}, 500

def criar_comanda():
    try:
        dados = request.json
        mesa_id = dados.get("mesa_id")
        cliente_cpf = dados.get("cliente_cpf")

        if not mesa_id or not cliente_cpf:
            return jsonify({"error": "Dados insuficientes para criar a comanda"}), 400

        numero_comanda = comandas.gerar_numero_comanda()
        sucesso = comandas.criar_comanda(mesa_id, numero_comanda)

        if sucesso:
            return jsonify({"id": numero_comanda, "mesa_id": mesa_id}), 201
        else:
            return jsonify({"error": "Erro ao criar comanda no banco de dados"}), 500
    except Exception as e:
        print(f"Erro ao criar comanda: {e}")
        return jsonify({"error": "Erro ao criar comanda"}), 500

    
def fechar_comanda(comanda_id):
    try:
        dados = request.json
        itens = dados.get("itens", [])
        total = dados.get("total")
        mesa_id = dados.get("mesa")

        if not (itens and total and mesa_id):
            return {"error": "Dados insuficientes para fechar a comanda"}, 400

        # Chama a entidade para realizar a atualização
        response, status_code = comandas.atualizar_status_comanda(
            comanda_id=comanda_id, total=total, mesa_id=mesa_id
        )

        return response, status_code
    except Exception as e:
        print(f"Erro ao fechar comanda no controlador: {e}")
        return {"error": "Erro interno no servidor"}, 500


def fechar_comanda_por_numero(numero_comanda):
    try:
        # Validação do formato do numero_comanda
        if not isinstance(numero_comanda, str) or len(numero_comanda) != 6:
            return {"error": "Formato do número da comanda inválido"}, 400

        comanda = comandas.obter_comanda_por_numero(numero_comanda)
        if not comanda:
            return {"error": "Comanda não encontrada"}, 404

        comanda_id = comanda["id"]
        mesa_id = comanda["mesa_id"]
        total = request.json.get("total")

        if total is None:
            return {"error": "Total não fornecido"}, 400

        response, status_code = comandas.atualizar_status_comanda(
            comanda_id=comanda_id, total=total, mesa_id=mesa_id
        )
        return response, status_code
    except Exception as e:
        print(f"Erro ao fechar comanda pelo número: {e}")
        return {"error": "Erro interno no servidor"}, 500


    
def listar_comandas():
    resultado = comandas.listar_comandas()
    if resultado is not None:
        return jsonify(resultado), 200
    return jsonify({"error": "Erro ao listar comandas"}), 500
