# Aplicação de Classificação e Resposta Automática de E-mails

## 📋 Descrição Geral
Aplicação web full stack para automatizar a leitura, classificação e sugestão de respostas para e-mails das categorias **Produtivo** e **Improdutivo**. Utiliza NLP, Google Gemini, Flask (backend) e Next.js/React (frontend). Testes com exemplos reais de emails incluídos.

---

## Contexto
Solução para empresas que lidam com grande volume de emails, automatizando triagem e resposta, liberando a equipe de tarefas repetitivas.

---

## Categorias de Classificação
- **Produtivo:** Requer ação ou resposta (ex.: solicitações, dúvidas, atualizações).
- **Improdutivo:** Não requer ação imediata (ex.: felicitações, agradecimentos).

---

## Visão Geral
Backend Flask recebe, pré-processa e classifica emails, sugerindo respostas automáticas via IA (Google Gemini). Frontend Next.js/React oferece interface moderna para envio, visualização, edição e cópia das respostas.

---

## Principais Fluxos
1. Envio do email (texto ou arquivo .txt/.pdf)
2. Pré-processamento (tokenização, stopwords, lematização)
3. Classificação via Gemini (Produtivo/Improdutivo + confiança)
4. Sugestão automática de resposta
5. Interação: copiar, editar, salvar resposta

---

## Tecnologias
- **Backend:** Python, Flask, pdfminer.six, NLTK, spaCy
- **IA/ML:** Google Gemini API
- **Frontend:** React, Next.js, TailwindCSS
- **Testes:** Casos reais em `casos_de_teste/`
- **Deploy:** Render

---

## Como Executar
1. Clone o repositório:
   ```bash
   git clone https://github.com/gcarucce10/emailClassifier.git
   cd emailClassifier
   ```
2. Crie o ambiente virtual Python:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
3. Instale dependências do backend:
   ```bash
   pip install -r requirements.txt
   python -m spacy download pt_core_news_md
   ```
4. Execute o projeto:
   ```bash
   ./start.sh
   ```
   Acesse localmente: http://localhost:3000
   
   Ou pelo link: [https://email-classifier-frontend.onrender.com/](https://email-classifier-frontend.onrender.com/) (Ainda não disponível)

> Node.js é necessário para o frontend funcionar.

---

## Estrutura do Projeto
```
backend/
  app.py                # Backend Flask principal
  gemini_client.py      # Integração com Google Gemini API
  preprocess.py         # Pré-processamento de texto
  templates/            # Templates HTML (Flask)
frontend/
  src/app/page.tsx      # Página principal Next.js/React
  ...                   # Outros arquivos do frontend
casos_de_teste/         # Casos de teste para o backend
  improdutivo.pdf       # Exemplo de email improdutivo em .pdf
  ...                   # Outros casos de teste
README.md
requirements.txt
start.sh                # Script de inicialização
render.yaml             # Configuração de deploy Render
```

---

## Funcionalidades Adicionais

- **Login e Registro de Usuários:**
  - A aplicação conta com páginas dedicadas para autenticação, permitindo que usuários se registrem e façam login de forma segura.
  - O acesso às funcionalidades principais pode ser restrito a usuários autenticados, garantindo privacidade e controle de uso.

- **Página de Respostas:**
  - Após a classificação, o usuário pode visualizar a resposta sugerida, editar o texto conforme necessário e copiar para uso externo.
  - O histórico de respostas pode ser exibido, facilitando o acompanhamento das interações realizadas.

- **Envio de Emails Integrado:**
  - A aplicação permite o envio direto de emails a partir da interface, utilizando a resposta gerada ou personalizada pelo usuário.
  - O envio pode ser feito para destinatários informados, integrando o fluxo de classificação e resposta ao processo real de comunicação.


- **Persistência de Dados:**
  - Todas as informações relevantes (emails enviados, classificações, respostas, histórico de interações) podem ser armazenadas em banco de dados, garantindo rastreabilidade e consulta futura.
  - A persistência permite relatórios, auditoria e integração com outros sistemas corporativos.

- **Registro de Usuário:**
  - Usuários podem se cadastrar na plataforma, criando contas próprias para acesso personalizado.
  - O registro pode incluir validação de email, campos personalizados e permissões diferenciadas.

- **Recuperação de Senha (Esqueci a Senha):**
  - A aplicação oferece funcionalidade de recuperação de senha, permitindo que o usuário solicite redefinição por email caso esqueça sua senha.
  - O processo é seguro e segue boas práticas de autenticação.

Essas funcionalidades tornam o sistema completo para uso corporativo, integrando automação, gestão de respostas, comunicação, segurança e controle de dados em uma única plataforma.

---



