# Makefile para publicação do site Tomahawk Saddles
# Configurações do servidor
SSH_HOST = 195.200.3.165
SSH_PORT = 65002
SSH_USER = u807363224
REMOTE_PATH = domains/customize.tomahawksaddles.com/public_html
BRANCH = main

# Cores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help deploy status check-git push-and-deploy test-connection

# Target padrão
help:
	@echo "$(GREEN)Tomahawk Saddles - Deploy Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "  make deploy          - Deploy changes to production server"
	@echo "  make push-and-deploy - Push to git and deploy to server"
	@echo "  make status          - Check git status and server connection"
	@echo "  make check-git       - Check if there are uncommitted changes"
	@echo "  make test-connection - Test SSH connection to server"
	@echo "  make help            - Show this help message"
	@echo ""

# Verificar conexão SSH
test-connection:
	@echo "$(YELLOW)Testing SSH connection...$(NC)"
	@ssh -p $(SSH_PORT) $(SSH_USER)@$(SSH_HOST) "echo 'Connection successful!' && pwd"

# Verificar status do git
check-git:
	@echo "$(YELLOW)Checking git status...$(NC)"
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "$(RED)Warning: You have uncommitted changes:$(NC)"; \
		git status --short; \
		echo ""; \
		echo "$(YELLOW)Do you want to continue anyway? [y/N]$(NC)"; \
		read -r response; \
		if [ "$$response" != "y" ] && [ "$$response" != "Y" ]; then \
			echo "$(RED)Deployment cancelled.$(NC)"; \
			exit 1; \
		fi; \
	else \
		echo "$(GREEN)Git working directory is clean.$(NC)"; \
	fi

# Verificar status geral
status: check-git test-connection
	@echo "$(GREEN)All checks passed!$(NC)"

# Deploy para o servidor
deploy: check-git
	@echo "$(YELLOW)Deploying to production server...$(NC)"
	@echo "$(YELLOW)Connecting to $(SSH_USER)@$(SSH_HOST):$(SSH_PORT)$(NC)"
	@ssh -p $(SSH_PORT) $(SSH_USER)@$(SSH_HOST) "\
		cd $(REMOTE_PATH) && \
		echo 'Current directory:' && pwd && \
		echo 'Pulling latest changes from $(BRANCH)...' && \
		git pull origin $(BRANCH) && \
		echo 'Deployment completed successfully!'"
	@echo "$(GREEN)✅ Deployment finished!$(NC)"
	@echo "$(GREEN)Site updated at: https://customize.tomahawksaddles.com$(NC)"

# Push para git e deploy
push-deploy:
	@echo "$(YELLOW)Pushing changes to git repository...$(NC)"
	@if [ -n "$$(git status --porcelain)" ]; then \
		echo "$(RED)You have uncommitted changes. Please commit them first.$(NC)"; \
		git status --short; \
		exit 1; \
	fi
	@git push origin $(BRANCH)
	@echo "$(GREEN)✅ Changes pushed to git repository$(NC)"
	@$(MAKE) deploy

# Target para desenvolvimento - commit rápido e deploy
quick-deploy:
	@echo "$(YELLOW)Quick deploy: adding, committing and deploying...$(NC)"
	@if [ -z "$(MSG)" ]; then \
		echo "$(RED)Error: Please provide a commit message with MSG='your message'$(NC)"; \
		echo "$(YELLOW)Example: make quick-deploy MSG='fix: update PDF generation'$(NC)"; \
		exit 1; \
	fi
	@git add .
	@git commit -m "$(MSG)"
	@git push origin $(BRANCH)
	@$(MAKE) deploy

# Backup do servidor (opcional)
backup:
	@echo "$(YELLOW)Creating backup of server files...$(NC)"
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	ssh -p $(SSH_PORT) $(SSH_USER)@$(SSH_HOST) "\
		cd $(REMOTE_PATH) && \
		tar -czf ../backup_$$timestamp.tar.gz . && \
		echo 'Backup created: ../backup_$$timestamp.tar.gz'"
	@echo "$(GREEN)✅ Backup completed$(NC)"

# Logs do servidor
logs:
	@echo "$(YELLOW)Fetching server logs...$(NC)"
	@ssh -p $(SSH_PORT) $(SSH_USER)@$(SSH_HOST) "\
		cd $(REMOTE_PATH) && \
		echo '=== Git Log (last 5 commits) ===' && \
		git log --oneline -5 && \
		echo '' && \
		echo '=== Current Branch ===' && \
		git branch --show-current && \
		echo '' && \
		echo '=== Last Modified Files ===' && \
		find . -name '*.js' -o -name '*.html' -o -name '*.css' | head -10 | xargs ls -la"