from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from src.routes.api import main_bp
from src.extensions import mail, login_manager, db
import os
from datetime import timedelta

def create_app():
    load_dotenv()

    app = Flask(__name__)

    # Configurações de e-mail
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # Configurações do JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=7)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(hours=8)
    jwt = JWTManager(app)

    # Configurações do Flask
    app.secret_key = os.getenv('FLASK_SECRET_KEY')
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True

    # Configuração do banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

    # Inicialização das extensões
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    mail.init_app(app)
    login_manager.init_app(app)
    db.init_app(app)

    # Blueprints
    app.register_blueprint(main_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
