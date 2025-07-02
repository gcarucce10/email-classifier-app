from flask import Flask, request, render_template, redirect, url_for, flash  
from preprocess import preprocess_pt  
from gemini_client import classify_email_gemini, generate_reply_gemini  
from utils import extract_email_text  

# Cria a aplicação Flask
app = Flask(__name__)
# Define a chave secreta para uso de mensagens flash
app.secret_key = "secret_key" 

# Rota principal: exibe o formulário inicial
@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

# Rota para processar o email enviado pelo usuário
@app.route("/processar", methods=["POST"])
def processar():
    # Inicializa a variável do texto original
    texto_original = ""
    # Verifica se um arquivo foi enviado e extrai o texto, senão pega o texto do formulário
    if 'file' in request.files and request.files['file'].filename != "":
        texto_original = extract_email_text(request.files['file'])
    else:
        texto_original = request.form.get('texto_email', '')

    # Se nenhum texto foi fornecido, exibe mensagem de erro e redireciona
    if not texto_original.strip():
        flash("Por favor, insira o texto do email ou faça o upload de um arquivo.")
        return redirect(url_for('index'))

    # Pré-processa o texto do email
    texto_limpo = preprocess_pt(texto_original)

    # Classifica o email como 'Produtivo' ou 'Improdutivo' usando o modelo Gemini
    categoria = classify_email_gemini(texto_limpo)
    # Gera uma resposta automática baseada na classificação
    resposta = generate_reply_gemini(categoria, texto_original)

    # Renderiza a página de resultado com a categoria, resposta e texto original
    return render_template("resultado.html",
                           categoria=categoria,
                           resposta=resposta,
                           texto=texto_original)

if __name__ == "__main__":
    app.run(debug=True)
