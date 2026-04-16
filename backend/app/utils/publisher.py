import json
from app.utils.redis_client import redis_client

def publish_progress(channel: str, data: dict):
    redis_client.publish(channel, json.dumps(data))