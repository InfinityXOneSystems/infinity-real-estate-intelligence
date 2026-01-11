import json, sys
v = json.load(open("taxonomy_contract/contract_version.json"))
if "current_version" not in v:
    sys.exit(1)
