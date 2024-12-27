from flask import jsonify, request
from ..connection.config import connect_db

def listar_mesas():
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, numero, status FROM mesas")
            mesas = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify([
                {"id": mesa[0], "numero": mesa[1], "status": mesa[2]}
                for mesa in mesas
            ]), 200
        except Exception as e:
            print(f"Erro ao listar mesas: {e}")
            return jsonify({"error": "Erro ao listar mesas"}), 500
    return jsonify({"error": "Erro ao conectar ao banco"}), 500

def criar_mesa():
    data = request.json
    numero = data.get("numero")
    if not numero:
        return jsonify({"error": "Número da mesa é obrigatório"}), 400

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("INSERT INTO mesas (numero) VALUES (%s) RETURNING id", (numero,))
            mesa_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Mesa criada com sucesso", "id": mesa_id}), 201
        except Exception as e:
            print(f"Erro ao criar mesa: {e}")
            return jsonify({"error": "Erro ao criar mesa"}), 500
    return jsonify({"error": "Erro ao conectar ao banco"}), 500

def atualizar_status_mesa(mesa_id):
    data = request.json
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status é obrigatório"}), 400

    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("UPDATE mesas SET status = %s WHERE id = %s", (status, mesa_id))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Status da mesa atualizado com sucesso"}), 200
        except Exception as e:
            print(f"Erro ao atualizar status da mesa: {e}")
            return jsonify({"error": "Erro ao atualizar status da mesa"}), 500
    return jsonify({"error": "Erro ao conectar ao banco"}), 500

def excluir_mesa(mesa_id):
    conn = connect_db()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM mesas WHERE id = %s", (mesa_id,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"message": "Mesa excluída com sucesso"}), 200
        except Exception as e:
            print(f"Erro ao excluir mesa: {e}")
            return jsonify({"error": "Erro ao excluir mesa"}), 500
    return jsonify({"error": "Erro ao conectar ao banco"}), 500
