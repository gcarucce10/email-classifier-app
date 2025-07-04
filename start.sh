#!/bin/bash

# ============================================
# CLASSIFICADOR DE EMAILS IA - SCRIPT DE INICIALIZAÇÃO
# ============================================

echo "🚀 Iniciando Classificador de Emails IA..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variáveis para PIDs
BACKEND_PID=""
FRONTEND_PID=""

# Função de cleanup
cleanup() {
    echo -e "\n${RED}🛑 Parando serviços...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    pkill -f "python3.*app.py" 2>/dev/null
    pkill -f "python3.*test_backend.py" 2>/dev/null
    pkill -f "next dev" 2>/dev/null
    
    echo -e "${GREEN}✅ Serviços parados!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar dependências básicas
echo -e "${BLUE}🔍 Verificando dependências...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 não encontrado${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
fi

# Verificar estrutura de diretórios
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Diretório 'backend' não encontrado!${NC}"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Diretório 'frontend' não encontrado!${NC}"
    exit 1
fi

# Instalar dependências mínimas do Python
echo -e "${BLUE}🐍 Verificando dependências Python...${NC}"
cd backend

pip3 install flask flask-cors 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Tentando instalar com --user...${NC}"
    pip3 install --user flask flask-cors
}

# Verificar se o backend original existe, senão usar o de teste
if [ -f "app.py" ]; then
    BACKEND_FILE="app.py"
    echo -e "${GREEN}✅ Usando backend original (app.py)${NC}"
else
    BACKEND_FILE="test_backend.py"
    echo -e "${YELLOW}⚠️  Usando backend de teste${NC}"
fi

# Configurar frontend
echo -e "${BLUE}⚛️  Configurando frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependências do frontend...${NC}"
    npm install
fi

# Iniciar backend
echo -e "${GREEN}🚀 Iniciando backend...${NC}"
cd ../backend

python3 $BACKEND_FILE &
BACKEND_PID=$!

# Aguardar backend
echo -e "${YELLOW}Aguardando backend inicializar...${NC}"
sleep 5

# Verificar backend com timeout
BACKEND_READY=false
for i in {1..10}; do
    if curl -s --connect-timeout 2 http://127.0.0.1:5000/ > /dev/null 2>&1; then
        BACKEND_READY=true
        break
    fi
    echo -e "${YELLOW}Tentativa $i/10...${NC}"
    sleep 2
done

if [ "$BACKEND_READY" = true ]; then
    echo -e "${GREEN}✅ Backend rodando em http://127.0.0.1:5000${NC}"
else
    echo -e "${RED}❌ Backend não respondeu${NC}"
    echo -e "${YELLOW}Tentando ver os logs do backend...${NC}"
    sleep 2
    cleanup
    exit 1
fi

# Iniciar frontend
echo -e "${GREEN}🚀 Iniciando frontend...${NC}"
cd ../frontend

npm run dev &
FRONTEND_PID=$!

sleep 8

# Verificar frontend
FRONTEND_READY=false
for i in {1..10}; do
    if curl -s --connect-timeout 2 http://127.0.0.1:3000/ > /dev/null 2>&1; then
        FRONTEND_READY=true
        break
    fi
    echo -e "${YELLOW}Aguardando frontend... $i/10${NC}"
    sleep 2
done

# Informações finais
echo -e "\n${GREEN}🎉 APLICAÇÃO INICIADA!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📧 Frontend: ${NC}http://localhost:3000"
echo -e "${GREEN}🐍 Backend:  ${NC}http://127.0.0.1:5000"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Acesse http://localhost:3000 no navegador${NC}"
echo -e "${YELLOW}💡 Pressione Ctrl+C para parar${NC}"

# Abrir navegador (corrigido para HTTP)
if command -v xdg-open &> /dev/null; then
    echo -e "${YELLOW}🌐 Abrindo navegador...${NC}"
    xdg-open http://localhost:3000 &
fi

# Manter rodando
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend parou!${NC}"
        cleanup
        exit 1
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend parou!${NC}"
        cleanup
        exit 1
    fi
    
    sleep 5
done
