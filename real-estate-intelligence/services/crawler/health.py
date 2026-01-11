from fastapi import FastAPI
import time

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True, "ts": time.time()}
