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
    
from ..entities import clientes

def listar_clientes():
    try:
        clientes_lista = clientes.listar_clientes()
        return clientes_lista, 200
    except Exception as e:
        print(f"Erro ao listar clientes: {e}")
        return {"error": "Erro ao listar clientes"}, 500

def remover_cliente(cliente_id):
    try:
        clientes.remover_cliente(cliente_id)
        return {"message": "Cliente removido com sucesso"}, 200
    except Exception as e:
        print(f"Erro ao remover cliente: {e}")
        return {"error": "Erro ao remover cliente"}, 500

