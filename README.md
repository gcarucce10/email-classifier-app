# Desafio AutoU – Classificação e Resposta Automática de E-mails

## 📋 Descrição Geral
Este projeto é uma aplicação web full stack que automatiza a leitura, classificação e sugestão de respostas para e-mails das categorias **Produtivo** e **Improdutivo**, utilizando técnicas de NLP, Google Gemini, Flask (backend) e Next.js/React (frontend).

---

## Contexto do Desafio

Criado para uma empresa do setor financeiro que lida com um alto volume de emails diariamente, o sistema visa automatizar a triagem e resposta de mensagens, liberando a equipe de tarefas repetitivas e aumentando a eficiência operacional.

---

## Categorias de Classificação

- **Produtivo:** Emails que requerem uma ação ou resposta específica (ex.: solicitações de suporte técnico, atualização sobre casos em aberto, dúvidas sobre o sistema).
- **Improdutivo:** Emails que não necessitam de uma ação imediata (ex.: mensagens de felicitações, agradecimentos).

---

## Visão Geral do Projeto

O sistema é composto por um backend em Flask responsável por receber, pré-processar e classificar emails, além de sugerir respostas automáticas utilizando IA generativa (Google Gemini). O frontend, desenvolvido em Next.js/React, oferece uma interface moderna e responsiva para o usuário interagir, enviar emails (texto ou arquivo), visualizar a classificação, confiança e editar/copiar a resposta sugerida.

---

### Principais Fluxos:

1. **Envio do Email:** O usuário pode colar o texto do email ou fazer upload de arquivos `.txt` ou `.pdf`.
2. **Pré-processamento:** O backend limpa e prepara o texto (tokenização, remoção de stopwords, lematização).
3. **Classificação:** O texto é enviado para a API Gemini, que retorna se o email é "Produtivo" ou "Improdutivo" e o grau de confiança.
4. **Sugestão de Resposta:** A IA sugere uma resposta automática adequada ao contexto do email.
5. **Interação do Usuário:** O usuário pode copiar, editar e salvar a resposta sugerida, além de iniciar um novo processo facilmente.

---

## Tecnologias Utilizadas

- **Backend:** Python, Flask, pdfminer (extração de texto de PDFs), NLTK e spaCy (pré-processamento de texto)
- **IA/ML:** Google Gemini API (classificação e sugestão de resposta)
- **Frontend:** React, Next.js, TailwindCSS
- **Deploy:** Render 

---

## Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/gcarucce10/emailClassifier.git
   cd emailClassifier
   ```
2. Crie um ambiente virtual Python (recomendado):
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
   
3. Instale as dependências do backend:
   ```bash
   pip install -r requirements.txt
   python -m spacy download pt_core_news_md
   ```

4. Execute o projeto (backend e frontend juntos) usando o script:
   ```bash
   ./start.sh
   ```

   A aplicação estará disponível em `http://localhost:3000` (ambiente local).

   Ou acesse a versão online já implantada em produção:
   👉 **https://email-classifier-frontend.onrender.com/**

> Certifique-se de que o Node.js está instalado para o frontend funcionar corretamente.

---

## Estrutura do Projeto

```
project/
  app.py                # Backend Flask principal
  gemini_client.py      # Integração com Google Gemini API
  preprocess.py         # Funções de pré-processamento de texto
  routes.py             # Rotas Flask (separadas, opcional)
  templates/            # Templates HTML (Flask)
frontend/
  src/app/page.tsx      # Página principal Next.js/React
  ...                   # Outros arquivos do frontend
README.md
requirements.txt
start.sh                # Shell script para iniciar o projeto
render.yaml             # Configuração do Render (deploy)
```

---

### Diferenciais:

- Interface intuitiva e responsiva, pronta para uso corporativo.
- Suporte a múltiplos formatos de entrada (texto, .txt, .pdf).
- Feedback visual e mensagens de erro amigáveis.
- Possibilidade de edição e cópia da resposta sugerida.
- Estrutura de código modular e pronta para expansão (ex: persistência, autenticação, logs avançados).


