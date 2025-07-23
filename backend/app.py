from flask import Flask, request, render_template, redirect, session, url_for, flash, jsonify
from flask_cors import CORS  
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from preprocess import preprocess_pt  
from gemini_client import classify_email_gemini, generate_reply_gemini  
from utils import extract_email_text
from models import EmailRecord
from models import User  
from database import db
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import os
import smtplib
import secrets
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Carrega variáveis de ambiente do .env
load_dotenv()

# Cria a aplicação Flask
app = Flask(__name__)

# Setup do banco de dados PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://useradd:mypass1234@localhost/db')
db.init_app(app)
migrate = Migrate(app, db)

# Configurar CORS para produção
CORS(app, origins=[
    "http://localhost:3000",  # Desenvolvimento local
    "https://email-classifier-backend-9s0r.onrender.com", # URL do backend no Render
    "*"  
], supports_credentials=True)

# Define a chave secreta para uso de mensagens flash
app.secret_key = os.environ.get("SECRET_KEY", "secret_key_fallback")

@app.route("/", methods=["GET"])
def home():
    """Endpoint de teste para verificar se a API está funcionando"""
    return jsonify({
        "message": "Email Classifier API está funcionando!",
        "status": "healthy",
        "endpoints": ["/api/classify", "/health"]
    })

@app.route("/health", methods=["GET"])
def health_check():
    """Health check para monitoramento"""
    return jsonify({"status": "healthy"}), 200

@app.route("/api/register", methods=["POST"])
def register():
    """Endpoint para registrar um novo usuário no banco de dados com validação SMTP."""
    data = request.get_json()
    email = data.get("email")
    senha = data.get("senha")
    smtp_password = data.get("smtp_password")

    if not email or not senha or not smtp_password:
        return jsonify({"error": "Email, senha e SMTP password são obrigatórios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Usuário já existe"}), 409

    # Valida as credenciais SMTP (teste de login)
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(email, smtp_password)  # tenta logar com e-mail + smtp_password
        server.quit()
    except Exception as e:
        print(f"Erro SMTP: {e}")
        return jsonify({"error": "Falha ao validar credenciais SMTP. Verifique sua senha de aplicativo."}), 401

    # Criação e persistência
    novo_usuario = User(
        email=email,
        password_hash=generate_password_hash(senha),
        smtp_password=smtp_password
    )
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"message": "Usuário criado com sucesso!"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    '''Endpoint para autenticar um usuário e iniciar uma sessão.'''
    data = request.get_json()
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    usuario = User.query.filter_by(email=email).first()
    if usuario and usuario.check_password(senha):
        session["user_id"] = usuario.id
        return jsonify({"message": "Login realizado com sucesso!"}), 200
    else:
        return jsonify({"error": "Credenciais inválidas"}), 401

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logout realizado com sucesso"}), 200

@app.route("/api/classify", methods=["POST"])
def classify_api():
    try:
        texto_original = ""
        
        # Verifica se um arquivo foi enviado
        if 'file' in request.files and request.files['file'].filename != "":
            file = request.files['file']
            texto_original = extract_email_text(file)
        # Senão, pega o texto do formulário
        elif 'email_text' in request.form:
            texto_original = request.form.get('email_text', '')
        else:
            return jsonify({
                "error": "Nenhum texto ou arquivo fornecido"
            }), 400

        # Valida se há conteúdo
        if not texto_original.strip():
            return jsonify({
                "error": "Por favor, insira o texto do email ou faça o upload de um arquivo."
            }), 400

        # Pré-processa o texto do email
        texto_limpo = preprocess_pt(texto_original)
        
        # Classifica o email usando o modelo Gemini
        categoria = classify_email_gemini(texto_limpo)
        
        # Gera uma resposta automática baseada na classificação
        resposta = generate_reply_gemini(categoria, texto_original)
        
        # Calcula uma confiança simulada (você pode implementar uma lógica real)
        confidence = 0.85 if "suporte" in texto_original.lower() or "solicitação" in texto_original.lower() else 0.75
        
        # Persistência no banco
        record = EmailRecord(
            email_text=texto_original,
            classification=categoria,
            suggested_response=resposta
        )
        db.session.add(record)
        db.session.commit()

        # Retorna o resultado em JSON
        return jsonify({
            "id": record.id,
            "category": categoria,
            "confidence": confidence,
            "suggested_response": resposta,
            "email_content": texto_original
        })
        
    except Exception as e:
        # Log do erro para debugging
        print(f"Erro na classificação: {str(e)}")
        return jsonify({
            "error": f"Erro interno do servidor: {str(e)}"
        }), 500

@app.route("/api/respostas/<int:id>", methods=["PUT"])
def atualizar_resposta(id):
    try:
        '''Endpoint para atualizar a resposta sugerida de um email classificado no banco de dados.'''
        data = request.get_json()
        nova_resposta = data.get("suggested_response")

        if not nova_resposta:
            return jsonify({"error": "Campo 'suggested_response' é obrigatório"}), 400

        # Busca o registro pelo ID
        registro = EmailRecord.query.get(id)
        if not registro:
            return jsonify({"error": "Registro não encontrado"}), 404

        # Atualiza a resposta sugerida
        registro.suggested_response = nova_resposta
        db.session.commit()

        return jsonify({
            "message": "Resposta atualizada com sucesso",
            "id": registro.id,
            "email_content": registro.email_text,
            "category": registro.classification,
            "confidence": data.get("confidence"),  
            "suggested_response": registro.suggested_response
        }), 200

    except Exception as e:
        print(f"Erro ao atualizar resposta: {str(e)}")
        return jsonify({"error": f"Erro interno ao atualizar: {str(e)}"}), 500

@app.route("/api/respostas", methods=["GET"])
def listar_respostas():
    '''Endpoint para listar todas as respostas sugeridas armazenadas no banco de dados.'''
    try:
        # Objeto para receber todos 
        registros = EmailRecord.query.order_by(EmailRecord.id.desc()).all()

        dados = [
            {
                "id": r.id,
                "email_content": r.email_text,
                "suggested_response": r.suggested_response,
                "category": r.classification,
            }
            for r in registros
        ]
        return jsonify(dados), 200

    except Exception as e:
        print(f"Erro ao buscar respostas: {str(e)}")
        return jsonify({"error": "Erro ao buscar respostas"}), 500

@app.route("/api/respostas/<int:id>", methods=["DELETE"])
def deletar_resposta(id):
    '''Endpoint para deletar uma resposta sugerida pelo ID.'''
    try:
        registro = EmailRecord.query.get(id)

        if not registro:
            return jsonify({"error": "Registro não encontrado"}), 404

        db.session.delete(registro)
        db.session.commit()

        return jsonify({"message": "Resposta deletada com sucesso"}), 200

    except Exception as e:
        print(f"Erro ao deletar resposta: {str(e)}")
        return jsonify({"error": "Erro interno ao deletar resposta"}), 500

@app.route("/api/send-email", methods=["POST"])
def send_email():
    '''Endpoint para enviar um e-mail usando as credenciais SMTP do usuário.'''
    data = request.get_json()
    to = data.get("to")
    subject = data.get("subject")
    response_id = data.get("response_id")

    if not to or not subject or not response_id:
        return jsonify({"error": "Parâmetros faltando"}), 400

    # Verifica se o usuário está logado
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    # Recupera usuário e credenciais de envio
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    smtp_user = user.email
    smtp_password = user.smtp_password

    # Busca a resposta no banco
    resposta = EmailRecord.query.get(response_id)
    if not resposta:
        return jsonify({"error": "Resposta sugerida não encontrada"}), 404

    body = resposta.suggested_response

    # Envio de e-mail usando SMTP Gmail
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    try:
        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to, msg.as_string())
        server.quit()

        return jsonify({"message": "E-mail enviado com sucesso!"}), 200

    except Exception as e:
        print(f"Erro ao enviar e-mail: {str(e)}")
        return jsonify({"error": "Erro ao enviar e-mail"}), 500

@app.route("/api/recuperar", methods=["POST"])
def recuperar_senha():
    '''Endpoint para recuperar a senha do usuário. Gera um token e envia link via email.'''
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Email não encontrado"}), 404

    # Gera token e define validade
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiration = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()

    # Link de recuperação
    link = f"http://localhost:3000/resetar-senha?token={token}"

    # Dados do remetente fixo
    smtp_sender_email = os.getenv("SMTP_SENDER_EMAIL") 
    smtp_sender_password = os.getenv("SMTP_SENDER_PASSWORD")
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    try:
        msg = MIMEMultipart()
        msg["From"] = smtp_sender_email
        msg["To"] = email
        msg["Subject"] = "Recuperação de Senha - Classificador de Emails"
        msg.attach(MIMEText(
            f"Olá,\n\nClique no link abaixo para redefinir sua senha:\n\n{link}\n\n"
            "Esse link expira em 1 hora.\n\nEquipe AutoU.", "plain"))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_sender_email, smtp_sender_password)
        server.sendmail(smtp_sender_email, email, msg.as_string())
        server.quit()

        return jsonify({"message": "Email de recuperação enviado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao enviar o email: {str(e)}"}), 500

@app.route("/api/resetar-senha", methods=["POST"])
def resetar_senha():
    '''Endpoint para inserir a nova senha e cadastrar no banco de dados.'''
    data = request.get_json()
    token = data.get("token")
    nova_senha = data.get("nova_senha")
    confirmar_nova_senha = data.get("confirmar_nova_senha") 

    if not nova_senha or not confirmar_nova_senha: 
        return jsonify({"error": "Nova senha e confirmação são obrigatórias"}), 400 

    if nova_senha != confirmar_nova_senha: 
        return jsonify({"error": "As senhas não coincidem"}), 400 
    
    user = User.query.filter_by(reset_token=token).first()
    if not user or user.reset_token_expiration < datetime.utcnow():
        return jsonify({"error": "Token inválido ou expirado"}), 400

    user.password_hash = generate_password_hash(nova_senha)
    user.reset_token = None
    user.reset_token_expiration = None
    db.session.commit()

    # Retorna o email do usuário na resposta de sucesso
    return jsonify({"message": "Senha atualizada com sucesso!", "email": user.email}), 200

@app.route("/api/respostas/<int:id>/editar", methods=["PUT"])
def editar_resposta(id):
    """Endpoint para editar uma resposta sugerida na página de respostas."""
    data = request.get_json()
    nova_resposta = data.get("nova_resposta")

    if not nova_resposta:
        return jsonify({"error": "A nova resposta não foi fornecida."}), 400

    email_record = EmailRecord.query.get(id)

    if not email_record:
        return jsonify({"error": "Resposta sugerida não encontrada."}), 404

    email_record.suggested_response = nova_resposta
    db.session.commit()

    return jsonify({"message": "Resposta atualizada com sucesso!"}), 200
    
# CONFIGURAÇÃO PARA PRODUÇÃO NO RENDER
if __name__ == "__main__":
    # Pega a porta do ambiente (Render define automaticamente)
    port = int(os.environ.get('PORT', 5000))
    
    # Roda a aplicação
    app.run(
        host='0.0.0.0',  # Permite conexões externas
        port=port,       # Usa a porta do Render
        debug=False      # Desabilita debug em produção
    )