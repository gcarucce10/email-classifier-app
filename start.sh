#!/usr/bin/env bash
set -o errexit -o pipefail

# ============================================
# CLASSIFICADOR DE EMAILS IA - SCRIPT DE INICIALIZAÇÃO
# ============================================

echo "🚀 Iniciando Classificador de Emails IA..."

# 💠 Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo -e "\n${RED}🛑 Parando serviços...${NC}"
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    pkill -f "flask run" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    echo -e "${GREEN}✅ Serviços parados!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 🔍 Verifica dependências
echo -e "${BLUE}🔍 Verificando dependências básicas...${NC}"
command -v python3 >/dev/null || { echo -e "${RED}❌ Python3 não encontrado${NC}"; exit 1; }
command -v node >/dev/null || { echo -e "${RED}❌ Node.js não encontrado${NC}"; exit 1; }

# 🐍 Ativa venv se existir
if [ -d "venv" ]; then
    echo -e "${BLUE}🐍 Ativando ambiente virtual...${NC}"
    source venv/bin/activate
fi

# 🧭 Variáveis do banco
DB_USER="useradd"
DB_NAME="db"

# 📦 Configura o backend
[ ! -d "backend" ] && { echo -e "${RED}❌ Diretório 'backend' não encontrado${NC}"; exit 1; }
cd backend

echo -e "${BLUE}🐍 Instalando dependências Python...${NC}"
pip3 install -r requirements.txt || { echo -e "${YELLOW}⚠️ Instalando com --user...${NC}"; pip3 install --user -r requirements.txt; }

# 🌐 Variáveis Flask
export FLASK_APP=backend.app:app
export FLASK_ENV=development
export PYTHONPATH=$(pwd)/..

# 🐘 Verifica se o serviço do PostgreSQL está rodando
echo -e "${BLUE}🐘 Verificando se o PostgreSQL está em execução...${NC}"
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠️ PostgreSQL não está rodando. Iniciando serviço...${NC}"
    sudo service postgresql start
    sleep 2
else
    echo -e "${GREEN}✅ PostgreSQL já está em execução.${NC}"
fi

# 🚀 Inicia backend
echo -e "${GREEN}🚀 Iniciando backend...${NC}"
flask run &> ../backend.log &
BACKEND_PID=$!

echo -e "${YELLOW}⏳ Aguardando backend inicializar...${NC}"
for i in {1..10}; do
    if curl -s --connect-timeout 2 http://127.0.0.1:5000/ > /dev/null; then
        echo -e "${GREEN}✅ Backend ativo${NC}"
        break
    fi
    echo -e "${YELLOW}Tentativa $i/10...${NC}"
    sleep 2
done

# 🧭 Frontend
cd ../frontend
[ ! -d "node_modules" ] && { echo -e "${YELLOW}💡 Instalando dependências frontend...${NC}"; npm install; }

echo -e "${GREEN}🚀 Iniciando frontend...${NC}"
npm run dev &> ../frontend.log &
FRONTEND_PID=$!

echo -e "${YELLOW}⏳ Aguardando frontend inicializar...${NC}"
for i in {1..10}; do
    if curl -s --connect-timeout 2 http://127.0.0.1:3000/ > /dev/null; then
        echo -e "${GREEN}✅ Frontend ativo${NC}"
        break
    fi
    echo -e "${YELLOW}Tentativa $i/10...${NC}"
    sleep 2
done

# ✅ Final
echo -e "\n${GREEN}🎉 APLICAÇÃO INICIADA COM SUCESSO!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📧 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}🐍 Backend: ${NC} http://127.0.0.1:5000"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Pressione Ctrl+C para parar tudo${NC}"

# 📎 Abre navegador
command -v xdg-open >/dev/null && xdg-open http://localhost:3000 &

# 🔄 Mantém o script ativo e monitora os serviços
while true; do
    ! kill -0 "$BACKEND_PID" 2>/dev/null && { echo -e "${RED}❌ Backend caiu!${NC}"; cleanup; }
    ! kill -0 "$FRONTEND_PID" 2>/dev/null && { echo -e "${RED}❌ Frontend caiu!${NC}"; cleanup; }
    sleep 5
done
