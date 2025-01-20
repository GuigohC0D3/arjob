from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, nome, cargo):
        self.id = id
        self.nome = nome
        self.cargo = cargo

    def get_id(self):
        return str(self.id)
