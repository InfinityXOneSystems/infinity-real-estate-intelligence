import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Canonical monorepo paths
PATHS = [
    ROOT,
    ROOT / "vision-cortex" / "src",
]

for p in PATHS:
    p = str(p)
    if p not in sys.path:
        sys.path.insert(0, p)

print("PYTHONPATH:")
for p in sys.path[:5]:
    print(" -", p)
