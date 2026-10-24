"""
Creates thermal_alarm_panel.json as a REAL, saved project owned by your
account, and marks it public - so it shows up on your profile page
(/u/<your username>) and in the Share community gallery, unlike the
client-side-only DEMO_PROJECTS entry in Share.jsx.

USAGE:
  1. pip install requests
  2. Edit CONFIG below
  3. Run: python create_public_project.py
"""

import json
import requests

# ---- CONFIG ----
API_BASE = "http://127.0.0.1:5000/api"
USERNAME = "akshay_07"
PASSWORD = "Akshay@07"
PROJECT_FILE = "thermal_alarm_panel.json"
# -----------------

with open(PROJECT_FILE) as f:
    data = json.load(f)

login_res = requests.post(f"{API_BASE}/auth/login", json={"username": USERNAME, "password": PASSWORD})
login_res.raise_for_status()
token = login_res.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

create_res = requests.post(
    f"{API_BASE}/projects",
    headers=headers,
    json={
        "name": data["name"],
        "description": data["description"],
        "circuit_json": data["circuit_json"],
    },
)
create_res.raise_for_status()
project_id = create_res.json()["project"]["id"]
print(f"Created project id {project_id}")

publish_res = requests.put(
    f"{API_BASE}/projects/{project_id}",
    headers=headers,
    json={"is_public": True},
)
publish_res.raise_for_status()
print("Marked public - check your profile page and the Share gallery.")