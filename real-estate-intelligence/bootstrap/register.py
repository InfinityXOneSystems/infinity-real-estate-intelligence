import json

def register_all():
    with open("bootstrap/config.json") as f:
        cfg = json.load(f)

    print("Registering system topology:")
    for k, v in cfg.items():
        print(f"- {k}: {v}")

    return True
