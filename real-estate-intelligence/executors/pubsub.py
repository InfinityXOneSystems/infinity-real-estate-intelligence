from google.cloud import pubsub_v1
import json, os

PROJECT_ID = os.getenv("GCP_PROJECT")
TOPIC_ID   = os.getenv("PUBSUB_TOPIC", "rei-execute")

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

def publish(payload):
    data = json.dumps(payload).encode("utf-8")
    publisher.publish(topic_path, data=data)
    return {"status": "queued", "topic": TOPIC_ID}
