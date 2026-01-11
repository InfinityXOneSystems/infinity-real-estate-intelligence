from flask import Flask, request, jsonify
from orchestrator.core import ready, execute

app = Flask(__name__)

@app.route("/ready", methods=["GET"])
def api_ready():
    return jsonify(ready())

@app.route("/execute", methods=["POST"])
def api_execute():
    return jsonify(execute(request.json))

@app.route("/health", methods=["GET"])
def health():
    return "ok", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
