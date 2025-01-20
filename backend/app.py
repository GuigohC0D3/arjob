from flask import Flask, request, render_template, jsonify
from flask_login import LoginManager
from dotenv import load_dotenv
from flask_cors import CORS
from src.routes.api import main_bp
import src.entities.users as user
from src.extensions import mail, login_manager  # Certifique-se de usar o login_manager já inicializado
import os

def create_app():
    load_dotenv()  # Carregar variáveis de ambiente do arquivo .env

    app = Flask(__name__)

    # Configurações do Flask-Mail
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = 'thundergametm@gmail.com'
    app.config['MAIL_PASSWORD'] = 'hhbt jzzy xdtj etdg'
    app.config['MAIL_DEFAULT_SENDER'] = 'thundergametm@gmail.com'

    # Inicializar extensões
    mail.init_app(app)
    login_manager.init_app(app)

    # Configuração do CORS
    cors = CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

    # Configuração da chave secreta
    app.secret_key = os.getenv('FLASK_SECRET_KEY', 'b2d79f7202d194fc6de942abc1297eeb44d5f4e5')

    # Definir a função de carregamento de usuários
    @login_manager.user_loader
    def load_user(user_id):
        # Retorna o usuário com base no ID armazenado na sessão
        return user.get_by_id(user_id)

    # Registrar blueprints
    app.register_blueprint(main_bp)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
