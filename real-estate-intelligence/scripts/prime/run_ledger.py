import json, pathlib, time
p = pathlib.Path("docs/system/RUN_LEDGER.json")
data = json.loads(p.read_text()) if p.exists() else []
data.append({"ts": time.time()})
p.write_text(json.dumps(data, indent=2))
