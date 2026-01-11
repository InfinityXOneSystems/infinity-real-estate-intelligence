import json, pathlib
pathlib.Path("docs/system/TODO_STATUS.json").write_text(
  json.dumps({"dry_run":True,"ran":False}, indent=2)
)
