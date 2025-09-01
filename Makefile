
.PHONY: backend-container frontend-container


backend-container:
	docker build -t steuer-fair-backend -f apps/api/Dockerfile .

frontend-container:
	docker build -t steuer-fair-frontend -f apps/web/Dockerfile .

run-backend:
	docker run -p 3001:3001 -e KNEX_MIGRATIONS_DIR=dist/migrations -e KNEX_SEEDS_DIR=dist/seeds --env-file apps/api/.env steuer-fair-backend

run-frontend:
	docker run -p 3000:3000 steuer-fair-frontend

run-all:
	docker run -p 3001:3001 steuer-fair-backend && docker run -p 3000:3000 steuer-fair-frontend

