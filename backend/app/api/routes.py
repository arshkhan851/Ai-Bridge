import json
import re
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.schemas import ChatRequest, ConversationCreate, ConversationOut, DocumentCreate, DocumentOut
from app.context.repository import SQLiteFTSRepository
from app.db.database import get_db
from app.models.document import Document
from app.models.conversation import Conversation, ConversationMessage
from app.services.chat import stream_reply

router = APIRouter(prefix="/api")

def safe_provider_error(error: Exception) -> str:
    """Keep the actionable provider response while never returning likely secrets."""
    message = re.sub(r"(?:sk|AIza)[-_A-Za-z0-9]{12,}", "[redacted]", str(error))[:500]
    return message or "The provider did not return an error message."

@router.get("/health")
def health(): return {"status": "ok"}

@router.get("/documents", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).all()

@router.post("/documents", response_model=DocumentOut, status_code=201)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    document = Document(**payload.model_dump())
    db.add(document); db.commit(); db.refresh(document)
    return document

@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(db: Session = Depends(get_db)):
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()

@router.post("/conversations", response_model=ConversationOut, status_code=201)
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    values = payload.model_dump(exclude={"messages"})
    conversation = Conversation(**values)
    db.add(conversation); db.flush()
    for message in payload.messages:
        db.add(ConversationMessage(conversation_id=conversation.id, role=message.role, content=message.content))
    if payload.messages and conversation.title == "New conversation":
        first_user = next((m.content for m in payload.messages if m.role == "user"), "Imported conversation")
        conversation.title = first_user[:80]
    db.commit(); db.refresh(conversation)
    return conversation

@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.get(Conversation, conversation_id)
    if not conversation: raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.post("/chat/stream")
async def chat_stream(payload: ChatRequest, db: Session = Depends(get_db)):
    async def events():
        try:
            conversation = db.get(Conversation, payload.conversation_id) if payload.conversation_id else None
            if conversation:
                previous_count = len(conversation.messages)
                for message in payload.messages[previous_count:]:
                    db.add(ConversationMessage(conversation_id=conversation.id, role=message.role, content=message.content))
                conversation.provider, conversation.model = payload.provider, payload.model
                if conversation.title == "New conversation":
                    first_user = next((m.content for m in payload.messages if m.role == "user"), "New conversation")
                    conversation.title = first_user[:80]
                db.commit()
            answer = ""
            async for token in stream_reply(payload.provider, payload.model, payload.messages, SQLiteFTSRepository(db)):
                answer += token
                yield f"event: token\ndata: {json.dumps({'text': token})}\n\n"
            if conversation:
                db.add(ConversationMessage(conversation_id=conversation.id, role="assistant", content=answer))
                db.commit()
            yield "event: done\ndata: {}\n\n"
        except ValueError as error:
            yield f"event: error\ndata: {json.dumps({'message': str(error)})}\n\n"
        except Exception as error:
            yield f"event: error\ndata: {json.dumps({'message': safe_provider_error(error)})}\n\n"
    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
