from flask import Flask, request, render_template, redirect, url_for, flash, jsonify
from flask_cors import CORS  
from preprocess import preprocess_pt  
from gemini_client import classify_email_gemini, generate_reply_gemini  
from utils import extract_email_text
import os

# Cria a aplicação Flask
app = Flask(__name__)

# Configurar CORS para produção
CORS(app, origins=[
    "http://localhost:3000",  # Desenvolvimento local
    "https://email-classifier-backend-9s0r.onrender.com",
    "*"  # Temporário para testes - remover em produção
])

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
        
        # Retorna o resultado em JSON
        return jsonify({
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