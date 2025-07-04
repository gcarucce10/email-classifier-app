from pdfminer.high_level import extract_text  


def extract_email_text(file_storage):
    """
    Extrai o texto de um arquivo enviado pelo usuário.
    Suporta arquivos .txt e .pdf. Retorna string vazia para outros formatos.
    """
    # Obtém o nome do arquivo em minúsculas
    filename = file_storage.filename.lower()
    # Lê o conteúdo do arquivo em bytes
    content = file_storage.read()
    # Se for um arquivo de texto simples (.txt), decodifica para string
    if filename.endswith(".txt"):
        return content.decode('utf-8', errors='ignore')
    # Se for um PDF, extrai o texto usando pdfminer
    elif filename.endswith(".pdf"):
        from io import BytesIO  
        fluxo = BytesIO(content)
        texto = extract_text(fluxo)  # Extrai o texto do PDF
        return texto
    # Para outros formatos, retorna string vazia
    else:
        return ""
