from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.routes import router
from app.core.config import ROOT
from app.db.database import Base, engine
from app.models import Document

app = FastAPI(title="AI Bridge")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router)

@app.on_event("startup")
def initialize_database():
    (ROOT / "data" / "database").mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(text("CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(title, content, content='documents', content_rowid='id')"))
        connection.execute(text("CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN INSERT INTO documents_fts(rowid,title,content) VALUES(new.id,new.title,new.content); END"))
        connection.execute(text("CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN INSERT INTO documents_fts(documents_fts,rowid,title,content) VALUES('delete',old.id,old.title,old.content); END"))
        connection.execute(text("CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN INSERT INTO documents_fts(documents_fts,rowid,title,content) VALUES('delete',old.id,old.title,old.content); INSERT INTO documents_fts(rowid,title,content) VALUES(new.id,new.title,new.content); END"))
