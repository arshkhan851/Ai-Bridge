from pydantic import BaseModel, ConfigDict, Field
from app.providers.base import ChatMessage

class ChatRequest(BaseModel):
    provider: str = Field(pattern="^(openai|anthropic|gemini)$")
    model: str = Field(min_length=1)
    messages: list[ChatMessage] = Field(min_length=1)
    conversation_id: int | None = None

class DocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)

class DocumentOut(DocumentCreate):
    id: int

class ConversationCreate(BaseModel):
    title: str = "New conversation"
    provider: str = Field(pattern="^(openai|anthropic|gemini)$")
    model: str = Field(min_length=1)
    messages: list[ChatMessage] = Field(default_factory=list)

class ConversationMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: str
    content: str

class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    provider: str
    model: str
    messages: list[ConversationMessageOut] = []
