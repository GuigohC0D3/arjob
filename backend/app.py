from flask import Flask, request, render_template, jsonify
from flask_login import LoginManager
from dotenv import load_dotenv
from flask_cors import CORS
import psycopg2 
from psycopg2 import sql
from src.routes.api import main_bp
import src.entities.users as user
import os

def create_app():
    load_dotenv()

    app = Flask(__name__)
    
    cors = CORS(app, resources={r"/*": {"origins": "*"}})

    app.secret_key = os.getenv('FLASK_SECRET_KEY', 'b2d79f7202d194fc6de942abc1297eeb44d5f4e5')

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        # Retorna o usuário com base no ID armazenado na sessão
        return user.get_by_id(user_id)
    
    app.register_blueprint(main_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)