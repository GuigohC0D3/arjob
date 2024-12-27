import psycopg2
from ..connection.config import connect_db


def listar_departamentos():
    """
    Retorna a lista de todos os departamentos.
    """
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            print("Executando consulta SQL para listar departamentos")  # Log

            # Busca todos os departamentos na tabela
            cur.execute("SELECT id, nome FROM departamento")
            departamento = cur.fetchall()
            print(f"Departamentos encontrados: {departamento}")  # Log dos resultados

            # Formata os resultados como uma lista de dicionários
            resultado = [{"id": dep[0], "nome": dep[1]} for dep in departamento]

            cur.close()
            conn.close()

            return {"data": resultado, "status": 200}
        except psycopg2.Error as e:
            print(f"Erro ao listar departamentos: {e}")  # Log do erro
            return {"error": "Erro ao listar departamentos", "status": 500}
    else:
        print("Erro ao conectar ao banco de dados")  # Log do erro de conexão
        return {"error": "Erro ao conectar ao banco de dados", "status": 500}
