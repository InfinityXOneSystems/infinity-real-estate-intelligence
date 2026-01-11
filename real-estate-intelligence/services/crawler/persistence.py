import json
import pathlib
import time


OUT = pathlib.Path("data/crawler")
OUT.mkdir(parents=True, exist_ok=True)


def persist(payload):
    p = OUT / f"{int(time.time()*1000)}.json"
    p.write_text(json.dumps(payload, indent=2))
