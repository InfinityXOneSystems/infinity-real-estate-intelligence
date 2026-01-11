import time
import requests
import uuid
while True:
    job = {
        "agent": "auto-scout",
        "task": "analyze_recent_memory",
        "id": str(uuid.uuid4())
    }
    requests.post("http://gateway:8080/ingest", json=job)
    print("agent executed")
    time.sleep(8)
