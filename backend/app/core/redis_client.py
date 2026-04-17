import redis
import json
from typing import Optional, Any
from app.core.config import settings

# Initialize Redis client
# Try connecting to Redis, fall back to None if unavailable
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None

def get_cache(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except Exception:
        return None

def set_cache(key: str, value: Any, expire: int = 300):
    if not redis_client:
        return
    try:
        redis_client.setex(key, expire, json.dumps(value))
    except Exception:
        pass

def delete_cache(key: str):
    if not redis_client:
        return
    try:
        redis_client.delete(key)
    except Exception:
        pass
