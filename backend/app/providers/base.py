from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class AIProvider(ABC):
    @abstractmethod
    async def stream(self, messages: list[ChatMessage], model: str) -> AsyncIterator[str]: ...
