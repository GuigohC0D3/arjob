from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from src.routes.api import main_bp
from src.extensions import mail, login_manager
import os
from datetime import timedelta

def create_app():
    load_dotenv()  # Carregar variáveis de ambiente do arquivo .env

    app = Flask(__name__)

    # Configurações do Flask-Mail
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'thundergametm@gmail.com'
    app.config['MAIL_PASSWORD'] = 'lcrw hhuj ggus sfey'
    app.config['MAIL_DEFAULT_SENDER'] = 'thundergametm@gmail.com'

    # Configurações do Flask-JWT-Extended
    app.config["JWT_SECRET_KEY"] = "e54f3bcb4a6d8ef0b21cd7dfef50c2b28d8578a5f1f8f4671a0b69a1c3f4f0c3"
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'uma_chave_secreta_segura')  # Defina sua chave secreta aqui
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=7)  # Access Token válido por 15 minutos
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(hours=8)  # Refresh Token válido por 8 horas
    jwt = JWTManager(app)  # Inicializa o JWTManager com o app

    # Configuração do CORS
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})

    # Configuração da chave secreta
    app.secret_key = os.getenv('FLASK_SECRET_KEY', 'b2d79f7202d194fc6de942abc1297eeb44d5f4e5')

    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True

    # Inicializar extensões
    mail.init_app(app)
    login_manager.init_app(app)

    # Registrar blueprints
    app.register_blueprint(main_bp)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
