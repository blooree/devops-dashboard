.PHONY: up down logs status clean build help

COMPOSE      = docker compose
COMPOSE_PROD = docker compose -f docker-compose.prod.yml

up: ## Start dev stack (builds from source)
	$(COMPOSE) up -d --build

down: ## Stop containers (keeps volumes)
	$(COMPOSE) down

logs: ## Follow all logs
	$(COMPOSE) logs -f

status: ## Show container status
	$(COMPOSE) ps

build: ## Re-build images without cache
	$(COMPOSE) build --no-cache

clean: ## Remove containers AND volumes
	$(COMPOSE) down -v

prod-up: ## Start production stack (pulls from Docker Hub)
	$(COMPOSE_PROD) up -d

prod-down: ## Stop production stack
	$(COMPOSE_PROD) down

help: ## Print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
