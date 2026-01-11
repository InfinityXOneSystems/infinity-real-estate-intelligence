def route(payload):
    if payload.get("type") == "llm":
        return "vision-cortex/src/llm-router"
    if payload.get("type") == "crawl":
        return "services/crawler"
    if payload.get("type") == "execute":
        return "executors"
    if payload.get("type") == "document":
        return "doc-evolution-system"
    return "orchestrator"
