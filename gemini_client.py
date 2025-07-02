import os
from google import genai

# Inicializa o client com sua chave
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-1.5-flash"

def classify_email_gemini(texto_limpo: str) -> str:
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
    response_schema = {
        "type": "string",
        "enum": ["Produtivo", "Improdutivo"]
    }
    resp = client.models.generate_content(
        model=MODEL,
        contents=[{"text": prompt}],
        config={
            "response_mime_type": "text/x.enum",
            "response_schema": response_schema
        }
    )
    return resp.text.strip().splitlines()[-1]

def generate_reply_gemini(categoria: str, texto_original: str) -> str:
    if categoria.lower() == "produtivo":
        reply_prompt = f"""
    Você é um assistente profissional. O email do cliente é:
    "{texto_original}"

    Padronize uma resposta formal automática, curta (até 60 palavras), respondendo diretamente as infomrações solicitadas no texto do email.
    Não inclua lacunas como [inserir data] para inserção de informações.
    Finalize sua resposta seguindo ESTE formato:
    
    Prezado(a) cliente (Inclua o nome do cliente se ele foi enviado no corpo do email),
    
    [texto da resposta (comece com letra minúscula)]

    (Duas quebras de linha)

    Atenciosamente,
    AutoU.
    """
    else:
        reply_prompt = f"""
    Você é um assistente educado. O email recebido é:
    "{texto_original}"

    Responda com:
    
    - "Prezado(a),"
    - Uma frase de agradecimento ou retribuição do que foi desejado
    - Duas quebras de linha

    Atenciosamente,
    AutoU.
    """
    resp = client.models.generate_content(
        model=MODEL,
        contents=[{"text": reply_prompt}]
    )
    return resp.text.strip()
