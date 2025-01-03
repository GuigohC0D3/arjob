from ..entities import clientes
import json

def add_client(nome=None, cpf=None, email=None, telefone=None, filial=None, convenio=None, departamento=None):
    try:
        # Validação básica dos campos obrigatórios
        if not nome or not cpf or not departamento:
            return json.dumps({'error': 'Campos obrigatórios: nome, cpf e departamento'}), 400

        # Chamar a entidade que processa o cadastro
        res = clientes.add_cliente(nome, cpf, email, telefone, filial, convenio, departamento)
        return json.dumps(res), res['status']
    except Exception as e:
        print("Erro no controlador add_client:", e)
        return json.dumps({"error": "Erro ao processar o cliente"}), 500


def buscar_cliente_por_cpf(cpf):
    try:
        # Use a função do módulo `clientes` para realizar a busca
        cliente = clientes.buscar_cliente_por_cpf(cpf)  # Presume-se que essa função exista
        if cliente:
            return cliente, 200
        else:
            return {"error": "Cliente não encontrado"}, 404
    except Exception as e:
        print(f"Erro no controlador buscar_cliente_por_cpf: {e}")
        return {"error": "Erro interno no servidor"}, 500
