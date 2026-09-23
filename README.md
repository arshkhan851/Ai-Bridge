# AI Bridge

Local, provider-neutral AI workspace. It streams conversations from OpenAI, Anthropic, or Gemini and retrieves relevant local notes using SQLite FTS5.

## Run

Backend (Python 3.12+):

```sh
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Frontend:

```sh
cd frontend
npm install
npm run dev -- --port 3000
```

Copy `backend/.env.example` to `backend/.env` and add whichever provider keys you use. Open `http://localhost:3000` in Brave or in any browser .
