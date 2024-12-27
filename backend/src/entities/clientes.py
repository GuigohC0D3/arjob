import psycopg2
from ..connection.config import connect_db

def add_cliente(nome, cpf, email, telefone, filial, convenio, departamento_id):
    """
    Adiciona um cliente e cria a associação com um departamento.
    """
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()

            # Log para verificar os dados a serem inseridos
            print("Inserindo cliente com dados:", {
                "nome": nome,
                "cpf": cpf,
                "email": email,
                "telefone": telefone,
                "filial": filial,
                "convenio": convenio
            })

            # Inserir cliente e retornar o ID
            cur.execute("""
                INSERT INTO clientes (nome, cpf, email, telefone, filial, convenio)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (nome, cpf, email, telefone, filial, convenio))
            cliente_id = cur.fetchone()[0]

            # Log do ID do cliente gerado
            print("Cliente inserido com ID:", cliente_id)

            # Inserir associação cliente-departamento
            cur.execute("""
                INSERT INTO departamento_cliente (cliente_id, departamento_id)
                VALUES (%s, %s)
            """, (cliente_id, departamento_id))

            conn.commit()
            cur.close()
            conn.close()

            return {'data': 'Cliente e associação adicionados com sucesso!', 'status': 201}
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar cliente: {e}")  # Log do erro específico
            return {'error': f"Erro ao adicionar cliente: {str(e)}", 'status': 500}
    else:
        print("Erro ao conectar ao banco de dados")
        return {'error': 'Erro ao conectar ao banco de dados', 'status': 500}
