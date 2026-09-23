from collections.abc import AsyncIterator
from anthropic import AsyncAnthropic
from app.providers.base import AIProvider, ChatMessage

class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str): self.client = AsyncAnthropic(api_key=api_key)
    async def stream(self, messages: list[ChatMessage], model: str) -> AsyncIterator[str]:
        system = "\n".join(m.content for m in messages if m.role == "system")
        conversation = [m.model_dump() for m in messages if m.role != "system"]
        async with self.client.messages.stream(model=model, max_tokens=2048, system=system, messages=conversation) as stream:
            async for text in stream.text_stream: yield text
