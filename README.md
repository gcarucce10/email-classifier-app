# Desafio AutoU – Classificação e Resposta Automática de E-mails

## 📋 Descrição Geral
Este projeto é uma aplicação web full stack que automatiza a leitura, classificação e sugestão de respostas para e-mails das categorias **Produtivo** e **Improdutivo**, utilizando técnicas de NLP, Google Gemini, Flask (backend) e Next.js/React (frontend).

---

## Contexto do Desafio

Criado para uma empresa do setor financeiro que lida com um alto volume de emails diariamente, o sistema visa automatizar a triagem e resposta de mensagens, liberando a equipe de tarefas repetitivas e aumentando a eficiência operacional.

---

## Funcionalidades Implementadas

- Upload de emails em formato `.txt` ou `.pdf` ou colagem direta do texto.
- Pré-processamento de texto em português (remoção de stopwords, lematização, etc).
- Classificação automática dos emails em **Produtivo** ou **Improdutivo** usando IA (Google Gemini API).
- Sugestão automática de resposta baseada na categoria do email.
- Interface web moderna e responsiva (Next.js/React + TailwindCSS).
- Exibição do resultado da classificação, confiança e resposta sugerida.
- Mensagens de erro amigáveis e feedback visual.

---


## Como Executar o Projeto

1. Crie um ambiente virtual Python (recomendado):
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Instale as dependências do backend:
   ```bash
   pip install -r requirements.txt
   ```
3. Execute o projeto (backend e frontend juntos) usando o script:
   ```bash
   ./start.sh
   ```
   O backend estará disponível em `http://localhost:5000` e o frontend em `http://localhost:3000`.

> Certifique-se de que o Node.js está instalado para o frontend funcionar corretamente.

---

## Estrutura do Projeto

```
project/
  app.py                # Backend Flask principal
  gemini_client.py      # Integração com Google Gemini API
  model_classifier.py   # (Opcional) Lógica de classificação local
  preprocess.py         # Funções de pré-processamento de texto
  routes.py             # Rotas Flask (separadas, opcional)
  static/               # Arquivos estáticos (Flask)
  templates/            # Templates HTML (Flask)
frontend/
  src/app/page.tsx      # Página principal Next.js/React
  ...                   # Outros arquivos do frontend
README.md
requirements.txt
```

---

## Categorias de Classificação

- **Produtivo:** Emails que requerem uma ação ou resposta específica (ex.: solicitações de suporte técnico, atualização sobre casos em aberto, dúvidas sobre o sistema).
- **Improdutivo:** Emails que não necessitam de uma ação imediata (ex.: mensagens de felicitações, agradecimentos).

---

## Tecnologias Utilizadas

- Python, Flask
- NLTK, spaCy (pré-processamento de texto)
- Google Gemini API (classificação e sugestão de resposta)
- React, Next.js, TailwindCSS (frontend)
- pdfminer (extração de texto de PDFs)

---

## Próximos Passos / Melhorias

- Permitir edição da resposta sugerida
- Melhorar tratamento de erros e logs


