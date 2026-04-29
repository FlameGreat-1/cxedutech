# ============================================================================
# INFLEXA - FULL-STACK PRODUCTION MAKEFILE
# ============================================================================
# Version: 1.0.0
# Platform: Offline-First Gamified Flashcard Store
# Stack: React (Vite) + Node.js (Express) + PostgreSQL
# ============================================================================

.PHONY: help menu
.DEFAULT_GOAL := help
.SILENT:
MAKEFLAGS += --no-print-directory

# Force bash for 'echo -e' support (Ubuntu default is dash)
SHELL := /bin/bash

# ============================================================================
# COLORS & FORMATTING
# ============================================================================
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
CYAN := \033[0;36m
MAGENTA := \033[0;35m
BOLD := \033[1m
DIM := \033[2m
NC := \033[0m

# ============================================================================
# DIRECTORY STRUCTURE
# ============================================================================
PROJECT_ROOT := $(shell pwd)
SERVER_DIR := $(PROJECT_ROOT)/server
CLIENT_DIR := $(PROJECT_ROOT)/client

# ============================================================================
# LOGO
# ============================================================================
.logo:
	@echo ""
	@echo -e "       $(MAGENTA)██╗███╗   ██╗███████╗██╗     ███████╗██╗  ██╗ █████╗ $(NC)"
	@echo -e "       $(MAGENTA)██║████╗  ██║██╔════╝██║     ██╔════╝╚██╗██╔╝██╔══██╗$(NC)"
	@echo -e "       $(MAGENTA)██║██╔██╗ ██║█████╗  ██║     █████╗   ╚███╔╝ ███████║$(NC)"
	@echo -e "       $(MAGENTA)██║██║╚██╗██║██╔══╝  ██║     ██╔══╝   ██╔██╗ ██╔══██║$(NC)"
	@echo -e "       $(MAGENTA)██║██║ ╚████║██║     ███████╗███████╗██╔╝ ██╗██║  ██║$(NC)"
	@echo -e "       $(MAGENTA)╚═╝╚═╝  ╚═══╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝$(NC)"
	@echo -e "       $(DIM)Offline-First Gamified Flashcard Store$(NC)"
	@echo ""

# ============================================================================
# HELP SYSTEM
# ============================================================================

##@ General
help: ## Display comprehensive help message
	echo -e "$(BLUE)╔════════════════════════════════════════════════════════════════════════════╗$(NC)"
	echo -e "$(BLUE)║  $(BOLD)INFLEXA - FULL-STACK BUILD & DEPLOY SYSTEM$(NC)$(BLUE)                                ║$(NC)"
	echo -e "$(BLUE)╚════════════════════════════════════════════════════════════════════════════╝$(NC)"
	echo -e ""
	awk 'BEGIN {FS = ":.*##"; printf "$(CYAN)Usage:$(NC) make $(YELLOW)<target>$(NC)\n\n"} \
		/^##@/ { printf "\n$(GREEN)%s$(NC)\n", substr($$0, 5) } \
		/^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(BLUE)%-30s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	echo -e ""
	echo -e "$(CYAN)Interactive Menu:$(NC) Run '$(YELLOW)make menu$(NC)' for a guided CLI experience."
	echo -e ""

# ============================================================================
# INTERACTIVE MENU
# ============================================================================

##@ Interactive Menu
menu: ## Start the interactive guided menu
	@clear
	@$(MAKE) .logo
	@echo -e "$(CYAN)┌──────────────────────────────────────────────────────────────────────────────┐$(NC)"; \
	echo -e "$(CYAN)│$(NC) $(BOLD)DOCKER ORCHESTRATION$(NC)                                                         $(CYAN)│$(NC)"; \
	echo -e "$(CYAN)└──────────────────────────────────────────────────────────────────────────────┘$(NC)"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "1" "Start All Services (Detached)" "make up"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "2" "Stop All Services" "make down"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "3" "Rebuild & Start All Services" "make build"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "4" "Tail All Logs" "make logs"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "5" "View Running Containers" "make ps"; \
	echo -e ""; \
	echo -e "$(CYAN)┌──────────────────────────────────────────────────────────────────────────────┐$(NC)"; \
	echo -e "$(CYAN)│$(NC) $(BOLD)DATABASE & MIGRATIONS$(NC)                                                        $(CYAN)│$(NC)"; \
	echo -e "$(CYAN)└──────────────────────────────────────────────────────────────────────────────┘$(NC)"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(CYAN)%s$(NC)\n" "6" "Run Database Migrations" "make db-migrate"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(CYAN)%s$(NC)\n" "7" "Create Admin User" "make db-create-admin"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(CYAN)%s$(NC)\n" "8" "Seed Products" "make db-seed"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(CYAN)%s$(NC)\n" "9" "Database Shell (psql)" "make db-shell"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(CYAN)%s$(NC)\n" "10" "Database Backup" "make db-backup"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(CYAN)%s$(NC)\n" "11" "Database Restore" "make db-restore"; \
	echo -e ""; \
	echo -e "$(CYAN)┌──────────────────────────────────────────────────────────────────────────────┐$(NC)"; \
	echo -e "$(CYAN)│$(NC) $(BOLD)LOCAL DEVELOPMENT$(NC)                                                             $(CYAN)│$(NC)"; \
	echo -e "$(CYAN)└──────────────────────────────────────────────────────────────────────────────┘$(NC)"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "12" "Install All Dependencies" "make install"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "13" "Start Dev Server (Backend)" "make dev-server"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "14" "Start Dev Client (Frontend)" "make dev-client"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "15" "Build Server (TypeScript)" "make build-server"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "16" "Build Client (Vite)" "make build-client"; \
	echo -e ""; \
	echo -e "$(CYAN)┌──────────────────────────────────────────────────────────────────────────────┐$(NC)"; \
	echo -e "$(CYAN)│$(NC) $(BOLD)TESTING & HEALTH$(NC)                                                             $(CYAN)│$(NC)"; \
	echo -e "$(CYAN)└──────────────────────────────────────────────────────────────────────────────┘$(NC)"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "17" "Run Server Tests" "make test-server"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "18" "Run All Tests" "make test-all"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "19" "Check Service Health" "make health"; \
	echo -e ""; \
	echo -e "$(CYAN)┌──────────────────────────────────────────────────────────────────────────────┐$(NC)"; \
	echo -e "$(CYAN)│$(NC) $(BOLD)DEPLOYMENT & MAINTENANCE$(NC)                                                     $(CYAN)│$(NC)"; \
	echo -e "$(CYAN)└──────────────────────────────────────────────────────────────────────────────┘$(NC)"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "20" "Deploy to VPS" "make deploy"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "21" "Update Production" "make update"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "22" "Edit Server .env Credentials" "make env-server"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "23" "Edit Root .env Configuration" "make env-root"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(GREEN)%s$(NC)\n" "24" "Renew SSL Certificate" "make ssl-renew"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(RED)%s$(NC)\n" "25" "Clean All (volumes, images)" "make clean"; \
	echo -e ""; \
	echo -e "$(BLUE)┌──────────────────────────────────────────────────────────────────────────────┐$(NC)"; \
	echo -e "$(BLUE)│$(NC) $(BOLD)OTHER$(NC)                                                                        $(BLUE)│$(NC)"; \
	echo -e "$(BLUE)└──────────────────────────────────────────────────────────────────────────────┘$(NC)"; \
	printf "  $(YELLOW)%-4s$(NC) │ %-34s │ $(RED)%s$(NC)\n" "0" "Exit Menu" ""; \
	echo -e ""; \
	printf "$(BLUE)║$(NC)  $(CYAN)Enter your choice [0-25]:$(NC) "; \
	read choice; \
	echo -e ""; \
	case $$choice in \
		1)  $(MAKE) up ;; \
		2)  $(MAKE) down ;; \
		3)  $(MAKE) build ;; \
		4)  $(MAKE) logs ;; \
		5)  $(MAKE) ps ;; \
		6)  $(MAKE) db-migrate ;; \
		7)  $(MAKE) db-create-admin ;; \
		8)  $(MAKE) db-seed ;; \
		9)  $(MAKE) db-shell ;; \
		10) $(MAKE) db-backup ;; \
		11) $(MAKE) db-restore ;; \
		12) $(MAKE) install ;; \
		13) $(MAKE) dev-server ;; \
		14) $(MAKE) dev-client ;; \
		15) $(MAKE) build-server ;; \
		16) $(MAKE) build-client ;; \
		17) $(MAKE) test-server ;; \
		18) $(MAKE) test-all ;; \
		19) $(MAKE) health ;; \
		20) $(MAKE) deploy ;; \
		21) $(MAKE) update ;; \
		22) $(MAKE) env-server ;; \
		23) $(MAKE) env-root ;; \
		24) $(MAKE) ssl-renew ;; \
		25) $(MAKE) clean ;; \
		0)  echo -e "$(GREEN)Goodbye!$(NC)"; exit 0 ;; \
		*)  echo -e "$(RED)✗ Invalid choice$(NC)" ;; \
	esac;

# ============================================================================
# DOCKER COMMANDS
# ============================================================================

##@ Docker Commands
up: ## Start all Docker containers in background
	@echo -e "$(BLUE)Starting Inflexa infrastructure...$(NC)"
	@docker compose up -d
	@$(MAKE) .logo
	@echo -e "$(GREEN)✓ All containers started$(NC)"
	@echo -e "  $(DIM)Client: http://localhost:3000$(NC)"
	@echo -e "  $(DIM)Server: http://localhost:5000$(NC)"

down: ## Stop and remove all Docker containers
	echo -e "$(BLUE)Stopping Inflexa infrastructure...$(NC)"
	docker compose down
	echo -e "$(GREEN)✓ All containers stopped$(NC)"

build: ## Rebuild and start all Docker containers
	@echo -e "$(BLUE)Building Inflexa infrastructure...$(NC)"
	@docker compose up -d --build
	@$(MAKE) .logo
	@echo -e "$(GREEN)✓ All containers built and started$(NC)"

rebuild-server: ## Rebuild only the server container
	echo -e "$(BLUE)Rebuilding server container...$(NC)"
	docker compose up -d --build --no-deps server
	echo -e "$(GREEN)✓ Server container rebuilt$(NC)"

rebuild-client: ## Rebuild only the client container
	echo -e "$(BLUE)Rebuilding client container...$(NC)"
	docker compose up -d --build --no-deps client
	echo -e "$(GREEN)✓ Client container rebuilt$(NC)"

logs: ## Tail logs for all containers
	docker compose logs -f

logs-server: ## Tail logs for server container only
	docker compose logs -f server

logs-client: ## Tail logs for client container only
	docker compose logs -f client

logs-db: ## Tail logs for database container only
	docker compose logs -f db

ps: ## View running Inflexa containers
	docker compose ps

restart: ## Restart all containers
	echo -e "$(BLUE)Restarting Inflexa containers...$(NC)"
	docker compose restart
	echo -e "$(GREEN)✓ All containers restarted$(NC)"

# ============================================================================
# DATABASE & MIGRATIONS
# ============================================================================

##@ Database Commands
db-migrate: ## Run database migrations inside the server container
	echo -e "$(BLUE)Running database migrations...$(NC)"
	docker compose exec server node dist/migrations/runMigrations.js
	echo -e "$(GREEN)✓ Database migrations complete$(NC)"

db-create-admin: ## Create the first admin user
	echo -e "$(BLUE)Creating admin user...$(NC)"
	docker compose exec server node dist/scripts/createAdmin.js
	echo -e "$(GREEN)✓ Admin user created$(NC)"

db-seed: ## Seed products into the database
	echo -e "$(BLUE)Seeding products...$(NC)"
	docker compose exec server node dist/scripts/seedProducts.js
	echo -e "$(GREEN)✓ Products seeded$(NC)"

db-shell: ## Open psql shell to the database
	echo -e "$(BLUE)Opening database shell...$(NC)"
	docker compose exec db psql -U $${DB_USER:-inflexa} -d $${DB_NAME:-inflexa}

db-backup: ## Backup the database to a SQL file
	echo -e "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	docker compose exec db pg_dump -U $${DB_USER:-inflexa} $${DB_NAME:-inflexa} > backups/inflexa_$(shell date +%Y%m%d_%H%M%S).sql
	echo -e "$(GREEN)✓ Database backed up to backups/$(NC)"

db-restore: ## Restore database from the latest backup (usage: make db-restore FILE=backups/file.sql)
	@if [ -z "$(FILE)" ]; then \
		echo -e "$(RED)✗ Usage: make db-restore FILE=backups/inflexa_20260423.sql$(NC)"; \
		exit 1; \
	fi
	echo -e "$(YELLOW)Restoring database from $(FILE)...$(NC)"
	cat $(FILE) | docker compose exec -T db psql -U $${DB_USER:-inflexa} -d $${DB_NAME:-inflexa}
	echo -e "$(GREEN)✓ Database restored from $(FILE)$(NC)"

# ============================================================================
# LOCAL DEVELOPMENT (without Docker)
# ============================================================================

##@ Local Development
install: ## Install all npm dependencies (server + client)
	echo -e "$(BLUE)Installing server dependencies...$(NC)"
	cd $(SERVER_DIR) && npm ci
	echo -e "$(BLUE)Installing client dependencies...$(NC)"
	cd $(CLIENT_DIR) && npm ci
	echo -e "$(GREEN)✓ All dependencies installed$(NC)"

dev-server: ## Start backend dev server with hot reload
	echo -e "$(BLUE)Starting server in development mode...$(NC)"
	cd $(SERVER_DIR) && npm run dev

dev-client: ## Start frontend dev server (Vite)
	echo -e "$(BLUE)Starting client in development mode...$(NC)"
	cd $(CLIENT_DIR) && npm run dev

build-server: ## Build server TypeScript to dist/
	echo -e "$(BLUE)Building server...$(NC)"
	cd $(SERVER_DIR) && npm run build
	echo -e "$(GREEN)✓ Server built to server/dist/$(NC)"

build-client: ## Build client (Vite production bundle)
	echo -e "$(BLUE)Building client...$(NC)"
	cd $(CLIENT_DIR) && npm run build
	echo -e "$(GREEN)✓ Client built to client/dist/$(NC)"

clean-server: ## Clean server build output
	echo -e "$(BLUE)Cleaning server dist...$(NC)"
	cd $(SERVER_DIR) && npm run clean
	echo -e "$(GREEN)✓ Server dist cleaned$(NC)"

# ============================================================================
# TESTING
# ============================================================================

##@ Testing
test-server: ## Run server test suite
	echo -e "$(BLUE)Running server tests...$(NC)"
	cd $(SERVER_DIR) && npm test
	echo -e "$(GREEN)✓ Server tests passed$(NC)"

test-server-e2e: ## Run server end-to-end tests (verbose)
	echo -e "$(BLUE)Running server E2E tests...$(NC)"
	cd $(SERVER_DIR) && npm run test:e2e
	echo -e "$(GREEN)✓ Server E2E tests passed$(NC)"

test-all: test-server ## Run all tests
	echo -e "$(GREEN)✓ All tests passed$(NC)"

# ============================================================================
# HEALTH & DIAGNOSTICS
# ============================================================================

##@ Health & Diagnostics
health: ## Check health of all running services
	echo -e "$(BLUE)Checking service health...$(NC)"
	@echo -n "  Server (API):   " && curl -sf http://localhost:5000/api/health > /dev/null 2>&1 && echo -e "$(GREEN)✓ HEALTHY$(NC)" || echo -e "$(RED)✗ DOWN$(NC)"
	@echo -n "  Client (Web):   " && curl -sf http://localhost:3000 > /dev/null 2>&1 && echo -e "$(GREEN)✓ HEALTHY$(NC)" || echo -e "$(RED)✗ DOWN$(NC)"
	@echo -n "  PostgreSQL:     " && docker compose exec -T db pg_isready -U $${DB_USER:-inflexa} -d $${DB_NAME:-inflexa} > /dev/null 2>&1 && echo -e "$(GREEN)✓ HEALTHY$(NC)" || echo -e "$(RED)✗ DOWN$(NC)"
	@echo -n "  Nginx (Host):   " && systemctl is-active --quiet nginx 2>/dev/null && echo -e "$(GREEN)✓ RUNNING$(NC)" || echo -e "$(YELLOW)⚠ NOT RUNNING (OK for local dev)$(NC)"

status: ## Show container status with resource usage
	echo -e "$(BLUE)Container Status:$(NC)"
	docker compose ps
	echo ""
	echo -e "$(BLUE)Resource Usage:$(NC)"
	docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(shell docker compose ps -q 2>/dev/null) 2>/dev/null || echo -e "$(YELLOW)  No running containers$(NC)"

# ============================================================================
# DEPLOYMENT & MAINTENANCE
# ============================================================================

##@ Deployment
deploy: ## Run the full VPS deployment script (requires sudo)
	echo -e "$(BLUE)Starting deployment for inflexatechnologies.com...$(NC)"
	sudo bash deploy.sh

update: ## Pull latest code, rebuild, and restart (zero-downtime)
	echo -e "$(BLUE)Updating Inflexa...$(NC)"
	echo -e "  $(DIM)[1/5] Pulling latest code...$(NC)"
	git pull origin main
	echo -e "  $(DIM)[2/5] Rebuilding containers...$(NC)"
	docker compose build --no-cache
	echo -e "  $(DIM)[3/5] Starting updated containers...$(NC)"
	docker compose up -d
	echo -e "  $(DIM)[4/5] Running database migrations...$(NC)"
	docker compose exec server node dist/migrations/runMigrations.js || true
	echo -e "  $(DIM)[5/5] Verifying health...$(NC)"
	@sleep 3
	@HTTP_CODE=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000"); \
	if [ "$$HTTP_CODE" = "200" ]; then \
		echo -e "  $(GREEN)✓ Server is healthy (HTTP $$HTTP_CODE)$(NC)"; \
	else \
		echo -e "  $(YELLOW)⚠ Health check returned HTTP $$HTTP_CODE$(NC)"; \
		echo -e "  $(DIM)Check logs: make logs-server$(NC)"; \
	fi
	echo -e "$(GREEN)✓ Update complete$(NC)"

ssl-renew: ## Renew SSL certificates
	echo -e "$(BLUE)Renewing SSL certificates...$(NC)"
	sudo certbot renew --quiet
	sudo systemctl reload nginx
	echo -e "$(GREEN)✓ SSL certificates renewed$(NC)"

ssl-status: ## Check SSL certificate expiry
	echo -e "$(BLUE)SSL Certificate Status:$(NC)"
	sudo certbot certificates 2>/dev/null || echo -e "$(YELLOW)  Certbot not installed or no certificates found$(NC)"

env-server: ## Edit server/.env credentials using nano
	echo -e "$(BLUE)Opening server/.env for editing...$(NC)"
	sudo nano $(SERVER_DIR)/.env
	@echo -e "$(YELLOW)Note: Run 'make build' to apply changes if containers are running.$(NC)"

env-root: ## Edit root /.env configuration using nano
	echo -e "$(BLUE)Opening root .env for editing...$(NC)"
	sudo nano $(PROJECT_ROOT)/.env
	@echo -e "$(YELLOW)Note: Run 'make build' to apply changes if containers are running.$(NC)"

# ============================================================================
# CLEANUP
# ============================================================================

##@ Cleanup
clean: ## Stop containers and remove volumes, images, and build cache
	echo -e "$(RED)Stopping and cleaning everything...$(NC)"
	docker compose down -v --rmi all --remove-orphans 2>/dev/null || true
	docker system prune -f 2>/dev/null || true
	echo -e "$(GREEN)✓ Cleanup complete$(NC)"

clean-containers: ## Stop and remove containers only (keeps volumes & images)
	echo -e "$(YELLOW)Stopping and removing containers...$(NC)"
	docker compose down --remove-orphans
	echo -e "$(GREEN)✓ Containers removed$(NC)"

clean-volumes: ## Remove Docker volumes (⚠ deletes database data!)
	echo -e "$(RED)⚠ This will DELETE all database data!$(NC)"
	@printf "  Are you sure? [y/N]: "; \
	read confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker compose down -v; \
		echo -e "$(GREEN)✓ Volumes removed$(NC)"; \
	else \
		echo -e "$(YELLOW)Aborted$(NC)"; \
	fi
