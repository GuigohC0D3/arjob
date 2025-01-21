from flask_mail import Mail
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

# Inicializar extensões
mail = Mail()
login_manager = LoginManager()

# Instância do SQLAlchemy
db = SQLAlchemy()
