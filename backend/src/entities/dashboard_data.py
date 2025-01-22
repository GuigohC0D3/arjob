from ..connection.config import connect_db

class DashboardData:
    @staticmethod
    def get_chart_data():
        conn = connect_db()
        if not conn:
            raise Exception("Erro ao conectar ao banco de dados")
        try:
            with conn.cursor() as cur:
                # Contagem de novos usuários/clientes nos últimos 6 meses
                cur.execute("""
                    SELECT
                        TO_CHAR(criado_em, 'MM-YYYY') AS month,
                        COUNT(CASE WHEN tipo = 'usuario' THEN 1 END) AS user_count,
                        COUNT(CASE WHEN tipo = 'cliente' THEN 1 END) AS client_count
                    FROM (
                        SELECT criado_em, 'usuario' AS tipo FROM usuarios
                        UNION ALL
                        SELECT criado_em, 'cliente' AS tipo FROM clientes
                    ) AS combined
                    WHERE criado_em >= NOW() - INTERVAL '6 months'
                    GROUP BY month
                    ORDER BY MIN(criado_em)
                """)
                data = cur.fetchall()

            labels = [row[0] for row in data]
            users = [row[1] for row in data]
            clients = [row[2] for row in data]

            return {
                "labels": labels,
                "datasets": [
                    {
                        "label": "Usuários",
                        "backgroundColor": "#42A5F5",
                        "data": users
                    },
                    {
                        "label": "Clientes",
                        "backgroundColor": "#FFA726",
                        "data": clients
                    }
                ]
            }
        finally:
            conn.close()

    @staticmethod
    def get_recent_activities():
        conn = connect_db()
        if not conn:
            raise Exception("Erro ao conectar ao banco de dados")
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT log_date, user_name, action
                    FROM logs
                    ORDER BY log_date DESC
                    LIMIT 10
                """)
                logs = cur.fetchall()

            return [
                {
                    "date": log[0].strftime("%Y-%m-%d %H:%M:%S"),
                    "user": log[1],
                    "action": log[2]
                }
                for log in logs
            ]
        finally:
            conn.close()
