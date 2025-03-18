from flask import jsonify, request
from ..entities import comandas, mesas, clientes, users

# ✅ Abre comanda sem cliente, apenas atendente
def abrir_comanda(mesa_id, atendente_id):
    try:
        if not users.verificar_se_usuario_eh_atendente(atendente_id):
            return {"error": "Usuário selecionado não é um atendente."}, 403

        comanda_existente = comandas.obter_comanda_por_mesa(mesa_id)
        if comanda_existente:
            return {"error": "Já existe uma comanda ativa para esta mesa."}, 400

        response, status_code = comandas.criar_comanda(mesa_id, atendente_id)

        if status_code == 201:
            mesas.atualizar_status_mesa(mesa_id, "ocupada")

        return response, status_code
    except Exception as e:
        print(f"❌ Erro ao abrir comanda: {e}")
        return {"error": "Erro interno no servidor"}, 500

# ✅ Fechar comanda usando o CODE como identificador
def fechar_comanda(code):
    try:
        dados = request.json
        print(f"🔹 Dados recebidos na requisição: {dados}")

        total = dados.get("total")
        mesa_id = dados.get("mesa_id")
        cliente_id = dados.get("cliente_id")
        pagamento_id = dados.get("pagamento_id")
        itens = dados.get("itens")

        # Validação
        if not (total and mesa_id and cliente_id and pagamento_id):
            return {
                "error": "Dados insuficientes para fechar a comanda",
                "recebido": dados
            }, 400

        comanda = comandas.obter_comanda_por_code(code)
        if not comanda:
            return {"error": "Comanda não encontrada"}, 404

        comanda_id = comanda["id"]

        # ✅ Atualiza status, grava histórico e itens
        response, status_code = comandas.atualizar_status_comanda(
            comanda_id=comanda_id,
            total=total,
            mesa_id=mesa_id,
            cliente_id=cliente_id,
            pagamento_id=pagamento_id,
            itens=itens
        )

        if status_code != 200:
            return response, status_code

        # ✅ Baixa estoque com base no histórico
        baixa_response = comandas.baixar_estoque(comanda_id)
        if baixa_response.get("error"):
            return baixa_response, 500

        # ✅ Libera a mesa
        mesas.atualizar_status_mesa(mesa_id, "disponivel")

        return {"message": "Comanda fechada, estoque atualizado e mesa liberada!"}, 200

    except Exception as e:
        print(f"❌ Erro ao fechar comanda pelo código: {e}")
        return {"error": "Erro interno no servidor"}, 500

# ✅ Fechar comanda pelo número (obsoleto se você usa o code)
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

        # Dados recebidos do frontend
        dados = request.json
        total = dados.get("total")
        itens = dados.get("itens", [])
        pagamento_id = dados.get("pagamento_id", 1)  # Exemplo: pagamento_id padrão 1
        usuario_id = dados.get("usuario_id", 1)      # Exemplo: usuário fixo 1 (pode ser via session ou token depois)

        if total is None:
            return {"error": "Total não fornecido"}, 400

        response, status_code = comandas.atualizar_status_comanda(
            comanda_id=comanda_id,
            total=total,
            mesa_id=mesa_id,
            itens=itens,
            pagamento_id=pagamento_id,
            usuario_id=usuario_id
        )

        return response, status_code

    except Exception as e:
        print(f"Erro ao fechar comanda pelo número: {e}")
        return {"error": "Erro interno no servidor"}, 500

# ✅ Criar comanda antiga (opcional, você pode remover se estiver usando abrir_comanda)
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
        print(f"❌ Erro ao criar comanda: {e}")
        return jsonify({"error": "Erro ao criar comanda"}), 500

# ✅ Listar todas as comandas
def listar_comandas():
    resultado = comandas.listar_comandas()
    if resultado is not None:
        return jsonify(resultado), 200
    return jsonify({"error": "Erro ao listar comandas"}), 500

# ✅ Buscar cliente por CPF
def buscar_clinete_por_cpf():
    try:
        dados = request.json
        cpf = dados.get("cpf")

        if not cpf:
            return jsonify({"error": "CPF é obrigatorio"}), 400

        cliente, status_code = clientes.buscar_cliente_por_cpf(cpf)

        if status_code != 200:
            return cliente, status_code

        return jsonify(cliente), 200

    except Exception as e:
        print(f"❌ Erro ao buscar cliente: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500

# ✅ Adicionar item à comanda
def add_item_comanda(comanda_id, produto_id, quantidade, preco_unitario):
    return comandas.adicionar_item_na_comanda(comanda_id, produto_id, quantidade, preco_unitario)

# ✅ Obter itens da comanda
def obter_itens_comanda(comanda_id):
    return comandas.obter_itens_comanda(comanda_id)

# ✅ Atualizar quantidade de item
def atualizar_quantidade_item(comanda_id, produto_id, nova_quantidade):
    if nova_quantidade < 0:
        return {"error": "Quantidade inválida"}, 400

    return comandas.atualizar_quantidade_item(comanda_id, produto_id, nova_quantidade)

# ✅ Remover item da comanda
def remover_item_da_comanda(comanda_id, item_id):
    try:
        return comandas.remover_item_da_comanda(comanda_id, item_id)
    except Exception as e:
        print(f"❌ Erro ao remover item da comanda: {e}")
        return {"error": "Erro interno no servidor"}, 500

# ✅ Listar itens de uma comanda
def listar_itens_da_comanda(comanda_id):
    try:
        itens, status = comandas.buscar_itens_da_comanda(comanda_id)
        return jsonify(itens), status
    except Exception as e:
        print(f"❌ Erro ao listar itens da comanda: {e}")
        return jsonify({"error": "Erro ao listar itens da comanda"}), 500

# ✅ Atualizar item da comanda
def atualizar_item_da_comanda(comanda_id, item_id):
    try:
        dados = request.json
        quantidade = dados.get("quantidade")

        if quantidade is None:
            return jsonify({"error": "Quantidade obrigatória"}), 400

        resposta, status = comandas.atualizar_quantidade_item(comanda_id, item_id, quantidade)
        return jsonify(resposta), status

    except Exception as e:
        print(f"❌ Erro ao atualizar item: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500


def fechar_comanda_por_id(comanda_id):
    try:
        dados = request.json
        total = dados.get("total")
        mesa_id = dados.get("mesa_id")
        cliente_id = dados.get("cliente_id")
        pagamento_id = dados.get("pagamento_id")
        itens = dados.get("itens")

        if not all([total, mesa_id, cliente_id, pagamento_id]):
            return {"error": "Dados insuficientes"}, 400

        return comandas.atualizar_status_comanda(
            comanda_id=comanda_id,
            total=total,
            mesa_id=mesa_id,
            cliente_id=cliente_id,
            pagamento_id=pagamento_id,
            itens=itens
        )

    except Exception as e:
        print(f"❌ Erro ao fechar comanda por id: {e}")
        return {"error": "Erro interno"}, 500


from flask import jsonify
from ..entities import comandas

def obter_comanda_por_mesa(mesa_id):
    try:
        print(f"➡️ Controller: Buscando comanda aberta para mesa {mesa_id}")

        comanda = comandas.obter_comanda_por_mesa(mesa_id)

        if comanda:
            print(f"✅ Controller: Comanda encontrada {comanda}")
            return jsonify({"comanda": comanda}), 200

        print(f"⚠️ Controller: Nenhuma comanda aberta para mesa {mesa_id}")
        return jsonify({
            "comanda": None,
            "message": "Nenhuma comanda aberta encontrada para esta mesa"
        }), 200

    except Exception as e:
        print(f"❌ Controller: Erro ao obter comanda por mesa {mesa_id}: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
