from fastapi import FastAPI
app = FastAPI()

@app.get("/status")
def get_status():
    return {"agent": "finsynapse", "status": "ready"}
@app.get("/health")
def health(): return {"status":"ok"}
@app.get("/ready")
def ready(): return {"ready":True}
