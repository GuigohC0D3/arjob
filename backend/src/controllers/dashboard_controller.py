from ..entities.dashboard_data import DashboardData

def get_dashboard_data():
    try:
        chart_data = DashboardData.get_chart_data()
        recent_activities = DashboardData.get_recent_activities()
        return {
            "chartData": chart_data,
            "recentActivities": recent_activities
        }
    except Exception as e:
        print(f"Erro ao carregar dados do dashboard: {e}")
        return None
