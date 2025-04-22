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
        pagamento_id = dados.get("pagamento_id")
        itens = dados.get("itens")
        usuario_id = dados.get("usuario_id")
        cliente_id = dados.get("cliente_id")  # ✅ Adicionado aqui

        # Validação
        if not (total and mesa_id and pagamento_id and cliente_id):
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
            pagamento_id=pagamento_id,
            itens=itens,
            usuario_id=usuario_id,
            cliente_id=cliente_id  # ✅ Aqui também
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


# ✅ Fechar comanda pelo número (opcional)
def fechar_comanda_por_numero(numero_comanda):
    try:
        comanda = comandas.obter_comanda_por_numero(numero_comanda)

        if not comanda:
            return {"error": "Comanda não encontrada"}, 404

        comanda_id = comanda["id"]
        mesa_id = comanda["mesa_id"]

        dados = request.json
        total = dados.get("total")
        itens = dados.get("itens")
        pagamento_id = dados.get("pagamento_id")
        usuario_id = dados.get("usuario_id")
        cliente_id = dados.get("cliente_id")  # ✅ Já estava aqui

        print(f"📥 Dados recebidos (fechar por número): {dados}")

        if not all([total, itens, pagamento_id, usuario_id, cliente_id]):
            return {"error": "Faltam dados para fechar a comanda"}, 400

        return comandas.fechar_comanda_completo(
            comanda_id=comanda_id,
            mesa_id=mesa_id,
            itens=itens,
            total=total,
            pagamento_id=pagamento_id,
            usuario_id=usuario_id,
            cliente_id=cliente_id  # ✅ Já estava aqui
        )

    except Exception as e:
        print(f"❌ Erro no fechamento da comanda: {e}")
        return {"error": "Erro interno no servidor"}, 500



# ✅ Fechar comanda pelo ID
def fechar_comanda_por_id(comanda_id):
    try:
        dados = request.json
        total = dados.get("total")
        cliente_id = dados.get("cliente_id")
        mesa_id = dados.get("mesa_id")
        pagamento_id = dados.get("pagamento_id")
        itens = dados.get("itens")
        usuario_id = dados.get("usuario_id")

        print(f"📥 Dados recebidos (fechar por ID): {dados}")

        if not all([total, mesa_id, pagamento_id, cliente_id]):
            return {"error": "Dados insuficientes"}, 400

        return comandas.atualizar_status_comanda(
            comanda_id=comanda_id,
            total=total,
            cliente_id=cliente_id,
            mesa_id=mesa_id,
            pagamento_id=pagamento_id,
            itens=itens,
            usuario_id=usuario_id
        )

    except Exception as e:
        print(f"❌ Erro ao fechar comanda por id: {e}")
        return {"error": "Erro interno"}, 500


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
def obter_itens_comanda(code):
    try:
        comanda = comandas.obter_comanda_por_code(code)

        if not comanda:
            return jsonify({"error": "Comanda não encontrada"}), 404

        comanda_id = comanda["id"]  # 💡 Aqui convertemos o code para ID
        itens, status = comandas.obter_itens_comanda(comanda_id)

        return jsonify(itens), status

    except Exception as e:
        print(f"❌ Erro ao obter itens da comanda histórica: {e}")
        return jsonify({"error": "Erro ao buscar itens"}), 500


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


# ✅ Buscar comanda por mesa
def obter_comanda_por_mesa(mesa_id):
    try:
        print(f"➡️ Controller: Buscando comanda aberta para mesa {mesa_id}")

        comanda = comandas.obter_comanda_por_mesa(mesa_id)

        if comanda:
            print(f"✅ Controller: Comanda encontrada {comanda}")
            return jsonify(comanda), 200  # ✅ retorna dict diretamente

        print(f"⚠️ Controller: Nenhuma comanda aberta para mesa {mesa_id}")
        return jsonify({
            "message": "Nenhuma comanda aberta encontrada para esta mesa"
        }), 404
    except Exception as e:
        print(f"❌ Controller: Erro ao obter comanda por mesa {mesa_id}: {e}")
        return jsonify({"error": "Erro interno no servidor"}), 500
