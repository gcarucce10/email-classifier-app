import os
from google import genai

# Inicializa o client Gemini usando a chave de API do ambiente
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Modelo Gemini utilizado para classificação e geração de resposta
MODEL = "gemini-1.5-flash"

def classify_email_gemini(texto_limpo: str) -> str:
    """
    Classifica um email como 'Produtivo' ou 'Improdutivo' usando o modelo Gemini.
    O prompt inclui exemplos claros para orientar a IA e restringe a resposta a apenas um dos dois termos.
    """
    prompt = f"""
Classifique este email em 'Produtivo' ou 'Improdutivo':

Exemplos IMPRODUTIVO:
Email: "Feliz Natal e próspero ano novo!"
Classificação: Improdutivo

Email: "Bom dia, obrigado pelo apoio ontem."
Classificação: Improdutivo

Toda e qualquer felicitação e agrecimento classificam o email como IMPRODUTIVO.

Exemplos PRODUTIVO:
Email: "Prezados, preciso de uma atualização sobre o contrato XYZ."
Classificação: Produtivo

Email: "Olá, podem me enviar o relatório de vendas do mês passado?"
Classificação: Produtivo

Solicitações de suporte técnico, atualização sobre casos em aberto, dúvidas sobre o sistema são sempre classificam o email como PRODUTIVO.

O email que você deve analisar é o seguinte: "{texto_limpo}"

A classificação deve ser apenas os termos 'Produtivo' ou 'Improdutivo'. Não inclua explicações ou justificativas.

Saída esperada: "Classificação: [Produtivo/Improdutivo]"""
    # Define o schema esperado para a resposta da IA
    response_schema = {
        "type": "string",
        "enum": ["Produtivo", "Improdutivo"]
    }
    # Chama o modelo Gemini para classificar o email
    resp = client.models.generate_content(
        model=MODEL,
        contents=[{"text": prompt}],
        config={
            "response_mime_type": "text/x.enum",
            "response_schema": response_schema
        }
    )
    # Retorna apenas a última linha da resposta, que deve conter a classificação
    return resp.text.strip().splitlines()[-1]

def generate_reply_gemini(categoria: str, texto_original: str) -> str:
    """
    Gera uma resposta automática para o email, adaptando o tom e o formato conforme a categoria.
    - Para emails produtivos: resposta formal e objetiva.
    - Para improdutivos: resposta educada e breve.
    """
    if categoria.lower() == "produtivo":
        # Prompt para resposta formal e direta, para emails produtivos
        reply_prompt = f"""
    Você é um assistente profissional. O email do cliente é:
    "{texto_original}"

    Padronize uma resposta formal automática, curta (no máximo 100 palavras), respondendo diretamente as infomrações solicitadas pelo email.
    NÃO inclua lacunas entre colchetes, do tipo [inserir data]/[inserir nome da etapa]/[inserir documento/item] para inserção de QUAISQUER informações SOB NUNHUMA CIRCUNSTÂNCIA.
    Finalize sua resposta seguindo ESTE formato:
    
    Prezado(a) cliente (Inclua o nome do cliente se ele foi enviado no corpo do email),
    
    [texto da resposta]

    (Duas quebras de linha)

    Atenciosamente,
    AutoU.
    """
    else:
        # Prompt para resposta educada e sucinta para emails improdutivos
        reply_prompt = f"""
    Você é um assistente educado. O email recebido é:
    "{texto_original}"

    Responda com:
    
    - "Prezado(a),"
    
    - Uma frase de agradecimento ou retribuição do que foi desejado.

    Atenciosamente,
    AutoU.
    """
    # Chama o modelo Gemini para gerar a resposta automática
    resp = client.models.generate_content(
        model=MODEL,
        contents=[{"text": reply_prompt}]
    )
    # Retorna a resposta gerada, já formatada
    return resp.text.strip()
