from collections.abc import AsyncIterator
from app.context.repository import ContextRepository
from app.providers.base import ChatMessage
from app.providers.factory import get_provider

async def stream_reply(provider_name: str, model: str, messages: list[ChatMessage], context: ContextRepository) -> AsyncIterator[str]:
    latest = next((m.content for m in reversed(messages) if m.role == "user"), "")
    docs = context.search(latest)
    if docs:
        sources = "\n\n".join(f"[{d.title}]\n{d.content}" for d in docs)
        messages = [ChatMessage(role="system", content=f"Use this local context when helpful.\n\n{sources}"), *messages]
    provider = get_provider(provider_name)
    async for token in provider.stream(messages, model): yield token
