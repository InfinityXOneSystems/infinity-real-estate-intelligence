from router.dispatch import dispatch

def ready():
    return {
        "status": "ready",
        "orchestrator": "active"
    }

def execute(payload):
    if "action" not in payload:
        return {"error": "Missing action"}, 400

    result = dispatch(payload)

    return {
        "orchestrator": "executed",
        "result": result
    }
