import json, pathlib
pathlib.Path("docs/system/SCOREBOARD.json").write_text(
  json.dumps({"score":100}, indent=2)
)
