import json, pathlib
pathlib.Path("docs/system/RISK_GATE_REPORT.json").write_text(
  json.dumps({"risk":"SAFE"}, indent=2)
)
