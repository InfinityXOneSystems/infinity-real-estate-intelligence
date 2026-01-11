def normalize(event):
    return {
        "id": event.get("id"),
        "entity": event.get("entity"),
        "type": event.get("type"),
        "timestamp": event.get("timestamp"),
        "facts": event.get("facts"),
        "source": event.get("source"),
        "confidence": float(event.get("confidence", 0.5))
    }
