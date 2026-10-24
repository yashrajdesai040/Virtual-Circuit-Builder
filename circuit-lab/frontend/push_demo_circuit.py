"""
Pushes esp32_led_demo_circuit.json into an existing project via your API.

USAGE:
  1. pip install requests
  2. Edit the CONFIG block below (username/password/project_id)
  3. Run: python push_demo_circuit.py

This logs in as you, then PUTs the demo circuit into the given project's
circuit_json - exactly as if you'd built it by hand in the Builder and hit
Save. It does NOT touch anything else about the project (name, description,
is_public are left as they are).
"""

import json
import requests

# ---- CONFIG - edit these ----
API_BASE = "http://127.0.0.1:5000/api"
USERNAME = "akshay_07"       # your login username
PASSWORD = "CHANGE_ME"       # your login password
PROJECT_ID = 1               # the shared project's id - check the URL bar
                              # when viewing it: /builder/<this number>
# ------------------------------

with open("esp32_led_demo_circuit.json") as f:
    circuit_json = json.load(f)

login_res = requests.post(f"{API_BASE}/auth/login", json={"username": USERNAME, "password": PASSWORD})
login_res.raise_for_status()
token = login_res.json()["token"]

put_res = requests.put(
    f"{API_BASE}/projects/{PROJECT_ID}",
    headers={"Authorization": f"Bearer {token}"},
    json={"circuit_json": circuit_json},
)

if put_res.status_code == 200:
    print("Demo circuit pushed successfully. Open the project in the Builder to see it.")
else:
    print(f"Failed ({put_res.status_code}): {put_res.text}")