from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, Project, ProjectCollaborator
from mna_solver import solve_circuit

simulate_bp = Blueprint("simulate", __name__, url_prefix="/api/projects")

SHORT_CIRCUIT_MA = 3000.0  # current above this is treated as a dangerous short for these small parts


def _accessible_project(project_id, user_id):
    project = Project.query.filter_by(id=project_id).first()
    if not project:
        return None
    if str(project.user_id) == str(user_id):
        return project
    is_collaborator = ProjectCollaborator.query.filter_by(
        project_id=project_id, user_id=user_id
    ).first()
    return project if is_collaborator else None


def build_suggestions(status, nodes, edges, readings):
    suggestions = []

    if not nodes:
        suggestions.append("Drag a power source onto the board to get started — try a 9V Battery or an ESP32.")
        return suggestions

    if status == "no_source":
        suggestions.append("Add a power source (battery, solar panel, or dev board) — nothing can run without one.")
    elif status == "open":
        suggestions.append("Wire a path from every part back to the source's other terminal to close the loop.")
    elif status == "short":
        suggestions.append("Put a resistor between the source and the rest of the circuit — nothing is limiting the current.")

    # real over-current check on LEDs, using the solved reading, not a guess
    for n in nodes:
        if n.get("key") != "led":
            continue
        r = readings.get(n["id"])
        if r and r["state"] == "on" and r["current_mA"] > 25:
            suggestions.append(
                f"{n['name']} is drawing {r['current_mA']:.0f}mA — that's above its ~20mA rating. "
                "Use a larger resistor to bring the current down."
            )

    wired_ids = {e["sourceId"] for e in edges} | {e["targetId"] for e in edges}
    stray = [n["name"] for n in nodes if n["id"] not in wired_ids]
    if stray:
        names = ", ".join(stray[:3])
        suggestions.append(f"{names} {'is' if len(stray) == 1 else 'are'} sitting unconnected — wire them in or remove them.")

    if status == "complete" and not suggestions:
        suggestions.append("Looks solid! Try adding a switch so you can turn it on and off.")

    return suggestions[:3]


def _run_solve(nodes, edges):
    """Shared by both the persisted 'Run circuit' endpoint and the live tick
    endpoint - solves the graph and turns the raw solver output into the
    same status/message/readings shape the frontend already expects."""
    node_by_id = {n["id"]: n for n in nodes}
    result = solve_circuit(nodes, edges)
    pin_voltages = result.get("board_pin_voltages", {})

    if not result["ok"]:
        status = "no_source"
        message = "No power source on the board. Add a battery, solar panel, or dev board to power the circuit."
        readings = {}
        powered_ids = []
    else:
        readings = result["readings"]
        powered_ids = [nid for nid, r in readings.items() if r["state"] == "on"]

        lit_leds = [
            f"{node_by_id[nid]['name']} ({readings[nid]['voltage']:.1f}V, {readings[nid]['current_mA']:.1f}mA)"
            for nid in powered_ids
            if node_by_id.get(nid, {}).get("key") == "led"
        ]

        if result["max_source_current_mA"] > SHORT_CIRCUIT_MA:
            status = "short"
            message = (
                f"Short circuit! ~{result['max_source_current_mA']:.0f}mA would flow — "
                "nothing is limiting the current. Add a resistor before you power this for real."
            )
        elif result["any_source_current"]:
            status = "complete"
            total_mA = sum(result["source_currents_mA"].values())
            if lit_leds:
                message = f"Circuit complete! {total_mA:.1f}mA flowing — {', '.join(lit_leds)} lights up."
            else:
                message = f"Circuit complete! {total_mA:.1f}mA flowing through the loop."
        else:
            status = "open"
            message = "Open circuit — there's no complete path back to the power source, so no current flows. Check your wiring."

    suggestions = build_suggestions(status, nodes, edges, readings)
    return status, message, readings, powered_ids, suggestions, pin_voltages


@simulate_bp.post("/<int:project_id>/simulate")
@jwt_required()
def simulate_circuit(project_id):
    """One-shot 'Run circuit' - reads the saved project, solves it, and
    records the result (last_run_status/run_count) like a real test run."""
    user_id = get_jwt_identity()
    project = _accessible_project(project_id, user_id)
    if not project:
        return jsonify({"error": "Project not found."}), 404

    circuit = project.circuit_json or {"nodes": [], "edges": []}
    nodes = circuit.get("nodes", [])
    edges = circuit.get("edges", [])

    status, message, readings, powered_ids, suggestions, pin_voltages = _run_solve(nodes, edges)

    project.last_run_status = status
    project.last_run_at = datetime.now(timezone.utc)
    project.run_count = (project.run_count or 0) + 1
    db.session.commit()

    return jsonify({
        "status": status,
        "message": message,
        "poweredIds": powered_ids,
        "suggestions": suggestions,
        "readings": readings,
        "pinVoltages": pin_voltages,
    }), 200


@simulate_bp.post("/<int:project_id>/simulate/live")
@jwt_required()
def simulate_live(project_id):
    """High-frequency tick used while ESP32 code is actually running in the
    browser interpreter. Takes the CURRENT in-memory nodes/edges straight
    from the request body (not the last saved version - the interpreter
    updates a board node's pin_states many times a second, far faster than
    anyone would want to autosave), solves once, and returns readings.
    Deliberately does NOT touch last_run_status/run_count/db.session.commit -
    only the explicit 'Run circuit' button counts as a real test run.
    """
    user_id = get_jwt_identity()
    project = _accessible_project(project_id, user_id)
    if not project:
        # not owned/shared with this user - but anyone can test-run a public
        # circuit read-only, same as viewing one (see CircuitView.jsx)
        project = Project.query.filter_by(id=project_id, is_public=True).first()
    if not project:
        return jsonify({"error": "Project not found."}), 404

    data = request.get_json(silent=True) or {}
    nodes = data.get("nodes") or []
    edges = data.get("edges") or []

    status, message, readings, powered_ids, suggestions, pin_voltages = _run_solve(nodes, edges)

    return jsonify({
        "status": status,
        "message": message,
        "poweredIds": powered_ids,
        "suggestions": suggestions,
        "readings": readings,
        "pinVoltages": pin_voltages,
    }), 200