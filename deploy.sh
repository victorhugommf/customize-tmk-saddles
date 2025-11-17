#!/bin/bash

# Script de deploy para Tomahawk Saddles
# Autor: Sistema de Deploy Automatizado
# Data: $(date +%Y-%m-%d)

# Configurações
SSH_HOST="195.200.3.165"
SSH_PORT="65002"
SSH_USER="u807363224"
REMOTE_PATH="domains/customize.tomahawksaddles.com/public_html"
BRANCH="main"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log com timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Função para sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para erro
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Função para verificar se o comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    if ! command_exists git; then
        error "Git não está instalado"
    fi
    
    if ! command_exists ssh; then
        error "SSH não está instalado"
    fi
    
    success "Todas as dependências estão instaladas"
}

# Verificar se estamos em um repositório git
check_git_repo() {
    log "Verificando repositório git..."
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Este diretório não é um repositório git"
    fi
    
    success "Repositório git válido"
}

# Verificar status do git
check_git_status() {
    log "Verificando status do git..."
    
    if [ -n "$(git status --porcelain)" ]; then
        warning "Você tem alterações não commitadas:"
        git status --short
        echo ""
        read -p "Deseja continuar mesmo assim? [y/N]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deploy cancelado pelo usuário"
        fi
    else
        success "Diretório de trabalho limpo"
    fi
}

# Testar conexão SSH
test_ssh_connection() {
    log "Testando conexão SSH..."
    
    if ssh -p $SSH_PORT -o ConnectTimeout=10 -o BatchMode=yes $SSH_USER@$SSH_HOST "echo 'test'" >/dev/null 2>&1; then
        success "Conexão SSH estabelecida com sucesso"
    else
        warning "Falha na conexão SSH automática, tentando conexão interativa..."
        if ! ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "echo 'Conexão SSH bem-sucedida!'"; then
            error "Não foi possível conectar ao servidor"
        fi
    fi
}

# Fazer backup (opcional)
create_backup() {
    if [ "$1" = "--backup" ]; then
        log "Criando backup do servidor..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        
        ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "
            cd $REMOTE_PATH &&
            tar -czf ../backup_$timestamp.tar.gz . &&
            echo 'Backup criado: ../backup_$timestamp.tar.gz'
        "
        
        success "Backup criado com sucesso"
    fi
}

# Deploy principal
deploy_to_server() {
    log "Iniciando deploy para o servidor..."
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "
        set -e
        echo '🚀 Iniciando deploy...'
        cd $REMOTE_PATH
        echo '📁 Diretório atual:' && pwd
        echo '📥 Baixando alterações do branch $BRANCH...'
        git pull origin $BRANCH
        echo '✅ Deploy concluído com sucesso!'
        echo '🌐 Site atualizado em: https://customize.tomahawksaddles.com'
    "
    
    if [ $? -eq 0 ]; then
        success "Deploy concluído com sucesso!"
        success "Site disponível em: https://customize.tomahawksaddles.com"
    else
        error "Falha durante o deploy"
    fi
}

# Push para git (se solicitado)
push_to_git() {
    if [ "$1" = "--push" ]; then
        log "Fazendo push para o repositório git..."
        
        if [ -n "$(git status --porcelain)" ]; then
            error "Você tem alterações não commitadas. Faça commit primeiro."
        fi
        
        git push origin $BRANCH
        success "Alterações enviadas para o repositório git"
    fi
}

# Mostrar logs do servidor
show_server_logs() {
    if [ "$1" = "--logs" ]; then
        log "Buscando logs do servidor..."
        
        ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "
            cd $REMOTE_PATH
            echo '=== Git Log (últimos 5 commits) ==='
            git log --oneline -5
            echo ''
            echo '=== Branch Atual ==='
            git branch --show-current
            echo ''
            echo '=== Status do Git ==='
            git status --short
        "
        exit 0
    fi
}

# Função de ajuda
show_help() {
    echo -e "${GREEN}Tomahawk Saddles - Script de Deploy${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo "  ./deploy.sh                 - Deploy básico"
    echo "  ./deploy.sh --push          - Push para git e deploy"
    echo "  ./deploy.sh --backup        - Criar backup antes do deploy"
    echo "  ./deploy.sh --logs          - Mostrar logs do servidor"
    echo "  ./deploy.sh --help          - Mostrar esta ajuda"
    echo ""
    echo -e "${YELLOW}Exemplos:${NC}"
    echo "  ./deploy.sh --push --backup - Push, backup e deploy"
    echo "  ./deploy.sh --logs          - Apenas mostrar logs"
    echo ""
}

# Função principal
main() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════╗"
    echo "║     Tomahawk Saddles - Deploy        ║"
    echo "║        Sistema Automatizado          ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificar argumentos
    case "$1" in
        --help|-h)
            show_help
            exit 0
            ;;
        --logs)
            show_server_logs --logs
            ;;
    esac
    
    # Verificações iniciais
    check_dependencies
    check_git_repo
    check_git_status
    test_ssh_connection
    
    # Executar ações baseadas nos argumentos
    create_backup "$@"
    push_to_git "$@"
    deploy_to_server
    
    echo ""
    success "🎉 Deploy finalizado com sucesso!"
    log "Verifique o site em: https://customize.tomahawksaddles.com"
}

# Executar função principal com todos os argumentos
main "$@"