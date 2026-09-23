from collections.abc import AsyncIterator
from google import genai
from app.providers.base import AIProvider, ChatMessage

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str): self.client = genai.Client(api_key=api_key)
    async def stream(self, messages: list[ChatMessage], model: str) -> AsyncIterator[str]:
        prompt = "\n".join(f"{m.role}: {m.content}" for m in messages)
        response = await self.client.aio.models.generate_content_stream(model=model, contents=prompt)
        async for chunk in response:
            if chunk.text: yield chunk.text
