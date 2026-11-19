import json
import logging
from typing import Any, Callable
from functools import wraps

import redis
from app.core.config import settings

logger = logging.getLogger("app.cache")

class RedisCacheManager:
    """
    High-performance Redis caching layer with automatic connection management,
    failover fallbacks, and non-blocking failure recovery.
    """

    def __init__(self):
        self._client: redis.Redis | None = None
        self._connected: bool = False
        self._has_warned: bool = False

    def _get_client(self) -> redis.Redis | None:
        if self._client is not None and self._connected:
            return self._client

        candidates = [
            settings.redis_url,
            "redis://groupchat-redis-1:6379/0",
            "redis://127.0.0.1:6379/0",
            "redis://localhost:6379/0",
        ]

        # Deduplicate while preserving order
        unique_urls = list(dict.fromkeys(candidates))

        for url in unique_urls:
            try:
                client = redis.Redis.from_url(
                    url,
                    decode_responses=True,
                    socket_timeout=2.0,
                    socket_connect_timeout=2.0,
                    retry_on_timeout=True,
                )
                if client.ping():
                    self._client = client
                    self._connected = True
                    logger.info("Connected to Redis cache at %s", url)
                    return self._client
            except Exception:
                continue

        if not self._has_warned:
            logger.warning("Redis is currently unavailable. Operating in bypass/graceful-fallback mode.")
            self._has_warned = True
        return None

    @property
    def is_available(self) -> bool:
        client = self._get_client()
        if not client:
            return False
        try:
            return bool(client.ping())
        except Exception:
            self._connected = False
            return False

    def get(self, key: str) -> str | None:
        client = self._get_client()
        if not client:
            return None
        try:
            return client.get(key)
        except Exception as e:
            logger.debug("Redis GET error on key '%s': %s", key, e)
            return None

    def set(self, key: str, value: str, ex: int | None = None) -> bool:
        client = self._get_client()
        if not client:
            return False
        try:
            return bool(client.set(key, value, ex=ex))
        except Exception as e:
            logger.debug("Redis SET error on key '%s': %s", key, e)
            return False

    def get_json(self, key: str) -> Any | None:
        raw = self.get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except Exception:
            return None

    def set_json(self, key: str, value: Any, ex: int = 300) -> bool:
        try:
            serialized = json.dumps(value, default=str)
            return self.set(key, serialized, ex=ex)
        except Exception as e:
            logger.debug("Redis set_json serialization error on key '%s': %s", key, e)
            return False

    def delete(self, key: str) -> bool:
        client = self._get_client()
        if not client:
            return False
        try:
            return bool(client.delete(key))
        except Exception as e:
            logger.debug("Redis DELETE error on key '%s': %s", key, e)
            return False

    def delete_pattern(self, pattern: str) -> int:
        """
        Scan and delete all keys matching pattern without blocking Redis (SCAN).
        """
        client = self._get_client()
        if not client:
            return 0
        try:
            count = 0
            keys_to_del = []
            for k in client.scan_iter(match=pattern, count=100):
                keys_to_del.append(k)
                if len(keys_to_del) >= 100:
                    client.delete(*keys_to_del)
                    count += len(keys_to_del)
                    keys_to_del = []
            if keys_to_del:
                client.delete(*keys_to_del)
                count += len(keys_to_del)
            return count
        except Exception as e:
            logger.debug("Redis delete_pattern error on pattern '%s': %s", pattern, e)
            return 0

    def get_info(self) -> dict[str, Any]:
        """
        Status & statistics for monitoring/health checks.
        """
        client = self._get_client()
        if not client:
            return {"status": "offline", "connected": False}
        try:
            info = client.info()
            return {
                "status": "online",
                "connected": True,
                "redis_version": info.get("redis_version"),
                "used_memory_human": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "uptime_in_days": info.get("uptime_in_days"),
            }
        except Exception as e:
            return {"status": "error", "error": str(e), "connected": False}


# Singleton cache manager instance
cache = RedisCacheManager()


# -------------------------------------------------------------
# Standardized Key Namespaces & Invalidation Helpers
# -------------------------------------------------------------
def make_key(namespace: str, *parts: Any) -> str:
    cleaned = ":".join(str(p).strip() for p in parts if p is not None)
    return f"gather:{namespace}:{cleaned}" if cleaned else f"gather:{namespace}"


def invalidate_group_messages(group_id: int):
    """Invalidate cached message lists and metadata for a group."""
    cache.delete_pattern(make_key("messages", group_id, "*"))
    cache.delete_pattern(make_key("group_status", group_id, "*"))


def invalidate_feed(post_id: int | None = None, community_slug: str | None = None):
    """Invalidate feed listings, post details, and communities."""
    cache.delete_pattern("gather:feed:*")
    if post_id:
        cache.delete(make_key("post", post_id))
    if community_slug:
        cache.delete_pattern(make_key("community", community_slug, "*"))


def invalidate_user_cache(user_id: int):
    """Invalidate cached user profiles."""
    cache.delete(make_key("user", user_id))
    cache.delete(make_key("user_profile", user_id))


def invalidate_groups_cache(user_id: int | None = None):
    """Invalidate cached group listings."""
    if user_id:
        cache.delete(make_key("user_groups", user_id))
    else:
        cache.delete_pattern("gather:user_groups:*")
