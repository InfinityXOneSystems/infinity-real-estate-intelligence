def normalize(event):
    return {
        "property_id": event.get("property_id"),
        "owner": event.get("owner"),
        "event_type": event.get("event_type"),
        "timestamp": event.get("timestamp"),
        "financials": event.get("financials"),
        "geo": event.get("geo"),
        "confidence": float(event.get("confidence", 0.6))
    }
