from collections.abc import AsyncIterator
from openai import AsyncOpenAI
from app.providers.base import AIProvider, ChatMessage

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str): self.client = AsyncOpenAI(api_key=api_key)
    async def stream(self, messages: list[ChatMessage], model: str) -> AsyncIterator[str]:
        stream = await self.client.chat.completions.create(model=model, messages=[m.model_dump() for m in messages], stream=True)
        async for chunk in stream:
            if text := chunk.choices[0].delta.content: yield text
