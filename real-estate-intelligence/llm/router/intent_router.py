import json

INTENT_MAP = {
  "scale": "system/scale",
  "start": "system/start",
  "stop": "system/stop",
  "status": "system/status",
  "diagnose": "system/diagnose",
  "crawl": "crawl/categories"
}

def route(nl_command: str):
    cmd = nl_command.lower()
    for k,v in INTENT_MAP.items():
        if k in cmd:
            return v
    return "system/status"
