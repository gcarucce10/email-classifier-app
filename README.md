# Aplicação de Classificação e Resposta Automática de E-mails

## 📋 Descrição Geral
Aplicação web full stack para automatizar a leitura, classificação e sugestão de respostas para e-mails das categorias **Produtivo** e **Improdutivo**. Utiliza NLP, Google Gemini, Flask (backend) e Next.js/React (frontend). Testes com exemplos reais de emails incluídos.

---

## Contexto
Solução para empresas, equipes ou profissionais que lidam com grande volume de emails, automatizando triagem e resposta.

---

## Categorias de Classificação
- **Produtivo:** Requer ação ou resposta urgente (ex.: solicitações, dúvidas, atualizações).
- **Improdutivo:** Não requer ação imediata (ex.: felicitações, agradecimentos).

---

## Visão Geral
Backend Flask recebe, pré-processa e classifica emails, sugerindo respostas automáticas via IA (Google Gemini). Frontend Next.js/React oferece interface moderna para envio, visualização, edição e cópia das respostas.

---

## Principais Fluxos
1. Login e registro de usuários
1. Envio do email (texto ou arquivo .txt/.pdf)
2. Pré-processamento (tokenização, stopwords, lematização)
3. Classificação via Gemini (Produtivo/Improdutivo + confiança)
4. Sugestão automática de resposta
5. Interação: copiar e editar resposta
6. Envio de email integrado
7. Classificação automática da caixa de entrada do email do usuário

---

## Tecnologias
- **Backend:** Python, Flask, pdfminer.six, NLTK, spaCy
- **IA/ML:** Google Gemini API (gemini-1.5-flash)
- **Frontend:** React, Next.js, TailwindCSS
- **Testes:** Casos reais em `casos_de_teste/`

---

## Como Executar
1. Clone o repositório:
   ```bash
   git clone https://github.com/gcarucce10/email-classifier-app.git
   cd email-classifier-app
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
   Acesse localmente no endereço: http://localhost:3000

   Observação: Variáveis de ambiente devem ser configuradas para a API do Google Gemini e outras credenciais necessárias (ex.: Email que tratará recuperação de senhas e banco de dados). Numa futura atualização, será realizado deploy da aplicação e essa sessão poderá ser desconsiderada.

> Node.js é necessário para o frontend funcionar.

---

## Estrutura do Projeto
```
backend/
  app.py                # Backend Flask principal
  gemini_client.py      # Integração com Google Gemini API
  preprocess.py         # Pré-processamento de texto
  models.py             # Modelos de entidades no banco de dados
  templates/            # Templates HTML (Flask) (teste de backend)
  requirements.txt      # Requisitos Python
frontend/
  src/app/page.tsx      # Página principal Next.js/React
  ...                   # Outros arquivos (telas) do frontend
casos_de_teste/         # Casos de teste (arquivos) 
  improdutivo.pdf       # Exemplo de email improdutivo em .pdf
  ...                   # Outros casos de teste
README.md
start.sh                # Script de inicialização
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
  - Na página de Respostas, a aplicação permite o envio direto de emails a partir da interface, utilizando a resposta gerada ou personalizada pelo usuário.
  - O envio pode ser feito para destinatários informados, integrando o fluxo de classificação e resposta ao processo real de comunicação.

- **Persistência de Dados:**
  - Todas as informações relevantes (emails enviados, classificações, respostas, histórico de interações) podem ser armazenadas em banco de dados, garantindo rastreabilidade e consulta futura.
  - A persistência permite relatórios, auditoria e integração com outros sistemas corporativos.
  - Persistências também dos dados do usuário.

- **Registro de Usuário:**
  - Usuários podem se cadastrar na plataforma, criando contas próprias para acesso personalizado.
  - O registro pode incluir nome, email e senha e senha de app Gmail.

- **Recuperação de Senha (Esqueci a Senha):**
  - A aplicação oferece funcionalidade de recuperação de senha, permitindo que o usuário solicite redefinição por email caso esqueça sua senha.
  - O processo é seguro e segue boas práticas de autenticação.

- **Classificação Automática da Caixa de Entrada:**
  - A aplicação pode acessar a caixa de entrada do usuário, classificando automaticamente os emails recebidos. Dispensando o trabalho manual de colar o texto ou anexar arquivos.

Essas funcionalidades tornam o sistema completo para uso corporativo, integrando automação, gestão de respostas, comunicação, segurança e controle de dados em uma única plataforma.

---



