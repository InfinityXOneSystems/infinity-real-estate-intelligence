import yaml, sys

with open("runtime/hydrate.yaml") as f:
    spec = yaml.safe_load(f)

print("Hydrating system:", spec["mode"])
