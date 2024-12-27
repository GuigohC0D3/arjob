from ..entities import departamento_clientes
import json


def listar_departamento_cliente():
    """
    Controlador para listar associações entre clientes e departamentos.
    """
    res = departamento_clientes.listar_departamento_cliente()
    return json.dumps(res), res['status']


def adicionar_departamento_cliente(cliente_id=None, departamento_id=None):
    """
    Controlador para adicionar uma associação cliente-departamento.
    """
    if not cliente_id or not departamento_id:
        return json.dumps({'data': 'cliente_id e departamento_id são obrigatórios'}), 400

    res = departamento_clientes.adicionar_departamento_cliente(cliente_id, departamento_id)
    return json.dumps(res), res['status']
