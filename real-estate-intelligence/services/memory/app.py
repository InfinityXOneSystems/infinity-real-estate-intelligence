from flask import Flask, request, jsonify
import json
import os
import datetime

app = Flask(__name__)
MEM_FILE = "memory.json"


def load_mem():
    if not os.path.exists(MEM_FILE):
        return []
    with open(MEM_FILE, "r") as f:
        return json.load(f)


def save_mem(data):
    with open(MEM_FILE, "w") as f:
        json.dump(data, f, indent=2)


@app.route("/memory/search", methods=["POST"])
def search():
    q = request.json.get("query", "").lower()
    mem = load_mem()
    hits = [m for m in mem if q in json.dumps(m).lower()]
    return jsonify(hits[:5])


@app.route("/memory/write", methods=["POST"])
def write():
    mem = load_mem()
    payload = request.json
    payload["_ts"] = datetime.datetime.utcnow().isoformat()
    mem.append(payload)
    save_mem(mem)
    return jsonify({"ok": True})


@app.route("/memory/read", methods=["GET"])
def read():
    return jsonify(load_mem())


@app.route("/health", methods=["GET"])
def health():
    return "ok", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
