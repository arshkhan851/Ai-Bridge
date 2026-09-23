.PHONY: backend frontend test
backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000
frontend:
	cd frontend && npm run dev -- --port 3000
test:
	cd backend && uv run pytest
	cd frontend && npm test
