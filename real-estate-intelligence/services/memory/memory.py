from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"service": "memory", "status": "online"}


@app.get("/health")
def health():
    return {"ok": True}
