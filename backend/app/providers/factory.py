from app.core.config import settings
from app.providers.base import AIProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.gemini_provider import GeminiProvider

def get_provider(name: str) -> AIProvider:
    providers = {
        "openai": (settings.openai_api_key, OpenAIProvider),
        "anthropic": (settings.anthropic_api_key, AnthropicProvider),
        "gemini": (settings.gemini_api_key, GeminiProvider),
    }
    if name not in providers: raise ValueError(f"Unknown provider: {name}")
    key, cls = providers[name]
    if not key: raise ValueError(f"{name.title()} API key is not configured")
    return cls(key)
