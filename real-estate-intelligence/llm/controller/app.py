from fastapi import FastAPI
import subprocess, json, os

app = FastAPI()

def sh(cmd):
    p = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return {"rc": p.returncode, "out": p.stdout, "err": p.stderr}

@app.get("/system/status")
def status():
    return sh("docker compose ps")

@app.post("/system/start")
def start(req: dict):
    return sh(f"docker compose up -d {req['service']}")

@app.post("/system/stop")
def stop(req: dict):
    return sh(f"docker compose stop {req['service']}")

@app.post("/system/scale")
def scale(req: dict):
    return sh(f"docker compose up -d --scale {req['service']}={req['replicas']}")

@app.post("/system/diagnose")
def diagnose():
    return sh("docker compose logs --tail 200")

@app.post("/crawl/categories")
def categories(req: dict):
    os.makedirs("config", exist_ok=True)
    with open("config/crawl_categories.json","w") as f:
        json.dump(req, f, indent=2)
    return {"ok": True}
@app.get("/health")
def health(): return {"status":"ok"}
@app.get("/ready")
def ready(): return {"ready":True}
