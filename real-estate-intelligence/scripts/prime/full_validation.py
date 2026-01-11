import json, time, subprocess, pathlib, sys

out_md = pathlib.Path("docs/system/FINAL_VALIDATION_REPORT.md")
out_json = pathlib.Path("docs/system/FINAL_VALIDATION_REPORT.json")

report = {"status": "ok","steps":[]}

def run(cmd):
    r = subprocess.run(cmd, shell=True)
    report["steps"].append({"cmd": cmd, "rc": r.returncode})
    if r.returncode != 0:
        report["status"] = "failed"
        sys.exit(1)

run("docker compose build")
run("docker compose up -d")
run("docker compose ps")

out_md.write_text("# Final Validation Report\n\nStatus: " + report["status"])
out_json.write_text(json.dumps(report, indent=2))
