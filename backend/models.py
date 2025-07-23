from datetime import datetime
from database import db
from werkzeug.security import check_password_hash, generate_password_hash


class EmailRecord(db.Model):
    __tablename__ = 'email_records'
    """Modelo para armazenar emails classificados"""
    id = db.Column(db.Integer, primary_key=True)
    email_text = db.Column(db.Text, nullable=False)
    classification = db.Column(db.String(50), nullable=False)
    suggested_response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<EmailRecord {self.id} - {self.classification}>"
    
class User(db.Model):
    __tablename__ = 'users'
    """Modelo para armazenar usuários do sistema"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    smtp_password = db.Column(db.String(1024), nullable=False)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiration = db.Column(db.DateTime, nullable=True)


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
