import json
import os
import threading
import time
from datetime import datetime, timezone

import psutil
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_DIR = os.environ.get("DATA_DIR", "/data")
DEPLOYMENTS_FILE = os.path.join(DATA_DIR, "deployments.json")
METRICS_FILE = os.path.join(DATA_DIR, "current_metrics.json")
APP_VERSION = os.environ.get("APP_VERSION", "dev")

metrics_history: list[dict] = []
history_lock = threading.Lock()


def collect_metrics() -> dict:
    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    net = psutil.net_io_counters()
    load = psutil.getloadavg()
    boot_time = psutil.boot_time()
    uptime = time.time() - boot_time

    return {
        "cpu_percent": round(cpu, 1),
        "cpu_count": psutil.cpu_count(logical=True),
        "memory_percent": round(mem.percent, 1),
        "memory_used_gb": round(mem.used / 1024**3, 2),
        "memory_total_gb": round(mem.total / 1024**3, 2),
        "disk_percent": round(disk.percent, 1),
        "disk_used_gb": round(disk.used / 1024**3, 2),
        "disk_total_gb": round(disk.total / 1024**3, 2),
        "network_bytes_sent_mb": round(net.bytes_sent / 1024**2, 2),
        "network_bytes_recv_mb": round(net.bytes_recv / 1024**2, 2),
        "uptime_seconds": int(uptime),
        "load_avg_1m": round(load[0], 2),
        "load_avg_5m": round(load[1], 2),
        "load_avg_15m": round(load[2], 2),
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def record_metrics():
    snapshot = collect_metrics()
    with history_lock:
        metrics_history.append(snapshot)
        if len(metrics_history) > 60:
            metrics_history.pop(0)

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(METRICS_FILE, "w") as fh:
        json.dump(snapshot, fh)


def _load_deployments() -> list:
    try:
        with open(DEPLOYMENTS_FILE) as fh:
            data = json.load(fh)
        return data.get("deployments", [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_deployments(deployments: list) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DEPLOYMENTS_FILE, "w") as fh:
        json.dump({"deployments": deployments}, fh, indent=2)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "version": APP_VERSION})


@app.route("/api/metrics")
def metrics():
    return jsonify(collect_metrics())


@app.route("/api/history")
def history():
    with history_lock:
        return jsonify({"history": list(metrics_history)})


@app.route("/api/deployments")
def deployments():
    all_deps = _load_deployments()
    return jsonify({"deployments": all_deps[-10:][::-1]})


@app.route("/api/deployments/register", methods=["POST"])
def register_deployment():
    body = request.get_json(force=True, silent=True) or {}
    all_deps = _load_deployments()
    next_id = (all_deps[-1]["id"] + 1) if all_deps else 1
    entry = {
        "id": next_id,
        "commit": body.get("commit", "unknown")[:7],
        "message": body.get("message", ""),
        "author": body.get("author", "ci"),
        "timestamp": body.get("timestamp", datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")),
        "status": body.get("status", "success"),
        "duration_sec": body.get("duration_sec", 0),
    }
    all_deps.append(entry)
    _save_deployments(all_deps)
    return jsonify({"ok": True, "deployment": entry}), 201


def _start_scheduler():
    """Called once by gunicorn/flask on real startup, skipped during import-only tests."""
    scheduler = BackgroundScheduler()
    scheduler.add_job(record_metrics, "interval", seconds=60)
    scheduler.start()
    record_metrics()


# Only auto-start when actually serving; CI smoke tests import without DATA_DIR=/data
if os.environ.get("SKIP_SCHEDULER") != "1":
    _start_scheduler()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
