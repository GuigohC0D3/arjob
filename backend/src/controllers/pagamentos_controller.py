from flask import jsonify
from ..entities import pagamentos  # ou tipos_pagamento

def listar_tipos_pagamento():
    result, status_code = pagamentos.listar_tipos_pagamento()
    return jsonify(result), status_code
