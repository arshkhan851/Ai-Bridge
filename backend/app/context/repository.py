from abc import ABC, abstractmethod
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.document import Document

class ContextRepository(ABC):
    @abstractmethod
    def search(self, query: str, limit: int = 5) -> list[Document]: ...

class SQLiteFTSRepository(ContextRepository):
    """Retrieval seam: replace this implementation when adding a vector store."""
    def __init__(self, db: Session): self.db = db
    def search(self, query: str, limit: int = 5) -> list[Document]:
        terms = " ".join(f'"{part}"' for part in query.split() if part)
        if not terms: return []
        rows = self.db.execute(text("""
          SELECT d.id, d.title, d.content, d.created_at FROM documents_fts f
          JOIN documents d ON d.id = f.rowid WHERE documents_fts MATCH :query
          ORDER BY rank LIMIT :limit
        """), {"query": terms, "limit": limit}).mappings().all()
        return [Document(**dict(row)) for row in rows]
