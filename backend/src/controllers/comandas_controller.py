from flask import jsonify, request
from ..entities import comandas, mesas, clientes, users

def abrir_comanda(mesa_id, atendente_id):
    try:
        # Verifica se o atendente_id realmente tem o cargo de atendente
        if not users.verificar_se_usuario_eh_atendente(atendente_id):
            return {"error": "Usuário selecionado não é um atendente."}, 403

        # Verifica se já existe uma comanda ativa na mesa
        comanda_existente = comandas.obter_comanda_por_mesa(mesa_id)
        if comanda_existente:
            return {"error": "Já existe uma comanda ativa para esta mesa."}, 400

        # Cria uma nova comanda sem CPF do cliente, mas com atendente
        response, status_code = comandas.criar_comanda(mesa_id, atendente_id)

        if status_code == 201:
            # Atualiza o status da mesa para ocupada
            mesas.atualizar_status_mesa(mesa_id, "ocupada")

        return response, status_code
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

    
def fechar_comanda(code):
    try:
        dados = request.json  # 🔥 Verifica se há um JSON válido na requisição

        # 🔍 Debug: Log dos dados recebidos
        print(f"🔹 Dados recebidos na requisição: {dados}")

        total = dados.get("total")
        mesa_id = dados.get("mesa")

        if not (total and mesa_id):
            return {"error": "Dados insuficientes para fechar a comanda", "recebido": dados}, 400  # 🔥 Adiciona os dados recebidos na resposta

        # 🔥 Buscar comanda pelo `code`
        comanda = comandas.obter_comanda_por_code(code)
        if not comanda:
            return {"error": "Comanda não encontrada"}, 404

        comanda_id = comanda["id"]

        # Agora fechamos corretamente a comanda
        response, status_code = comandas.atualizar_status_comanda(
            comanda_id=comanda_id, total=total, mesa_id=mesa_id
        )

        return response, status_code
    except Exception as e:
        print(f"Erro ao fechar comanda pelo código: {e}")
        return {"error": "Erro interno no servidor"}, 500



def fechar_comanda_por_numero(numero_comanda):
    try:
        # Validação do número da comanda
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

        # Atualiza o status da comanda e mesa
        response, status_code = comandas.atualizar_status_comanda(
            comanda_id=comanda_id, total=total, mesa_id=mesa_id
        )
        if status_code == 200:
            mesas.atualizar_status_mesa(mesa_id, False)  # Define mesa como disponível

        return response, status_code
    except Exception as e:
        print(f"Erro ao fechar comanda pelo número: {e}")
        return {"error": "Erro interno no servidor"}, 500


    
def listar_comandas():
    resultado = comandas.listar_comandas()
    if resultado is not None:
        return jsonify(resultado), 200
    return jsonify({"error": "Erro ao listar comandas"}), 500


def buscar_clinete_por_cpf():
    try:
        dados = request.json
        cpf = dados.get("cpf")

        if not cpf:
            return jsonify({"error": "CPF é obrigatorio"}), 400
        

        # Buscar Cliente
        cliente, status_code = clientes.buscar_cliente_por_cpf(cpf)
        
        if status_code != 200:
            return cliente, status_code
        
        return jsonify(cliente), 200
    except Exception as e:
        print(f"Erro ao buscar cliente: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
    
def add_item_comanda(comanda_id, produto_id, quantidade, preco_unitario):
    return comandas.adicionar_item_na_comanda(comanda_id, produto_id, quantidade, preco_unitario)

def obter_itens_comanda(comanda_id):
    return comandas.obter_itens_comanda(comanda_id)

def atualizar_quantidade_item(comanda_id, produto_id, nova_quantidade):
    if nova_quantidade < 0:
        return {"error": "Quantidade inválida"}, 400

    return comandas.atualizar_quantidade_item(comanda_id, produto_id, nova_quantidade)

def remover_item_da_comanda(comanda_id, item_id):
    try:
        return comandas.remover_item_da_comanda(comanda_id, item_id)
    except Exception as e:
        print(f"Erro no controlador ao remover item da comanda: {e}")
        return {"error": "Erro interno no servidor"}, 500
def listar_itens_da_comanda(comanda_id):
    try:
        itens, status = comandas.buscar_itens_da_comanda(comanda_id)
        return jsonify(itens), status
    except Exception as e:
        print(f"Erro ao listar itens da comanda: {e}")
        return jsonify({"error": "Erro ao listar itens da comanda"}), 500

def atualizar_item_da_comanda(comanda_id, item_id):
    try:
        dados = request.json
        quantidade = dados.get("quantidade")

        if quantidade is None:
            return jsonify({"error": "Quantidade obrigatória"}), 400

        resposta, status = comandas.atualizar_quantidade_item(comanda_id, item_id, quantidade)
        return jsonify(resposta), status
    except Exception as e:
        print(f"Erro ao atualizar item: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
