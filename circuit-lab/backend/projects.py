from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, Project, ProjectCollaborator, ProjectInvite, User

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


def _accessible_project(project_id, user_id):
    """Returns the project if the user owns it or has been added as a collaborator."""
    project = Project.query.filter_by(id=project_id).first()
    if not project:
        return None
    if str(project.user_id) == str(user_id):
        return project
    is_collaborator = ProjectCollaborator.query.filter_by(
        project_id=project_id, user_id=user_id
    ).first()
    return project if is_collaborator else None


def _is_owner(project, user_id):
    return str(project.user_id) == str(user_id)


@projects_bp.get("")
@jwt_required()
def list_projects():
    user_id = get_jwt_identity()
    owned = Project.query.filter_by(user_id=user_id).all()
    shared_ids = [
        c.project_id for c in ProjectCollaborator.query.filter_by(user_id=user_id).all()
    ]
    shared = Project.query.filter(Project.id.in_(shared_ids)).all() if shared_ids else []
    items = sorted(owned + shared, key=lambda p: p.updated_at, reverse=True)
    return jsonify({"projects": [p.to_dict(viewer_id=user_id) for p in items]}), 200


@projects_bp.post("")
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "Untitled Circuit").strip()[:120]
    description = (data.get("description") or "").strip()[:2000]
    circuit_json = data.get("circuit_json") or {"nodes": [], "edges": []}

    project = Project(
        user_id=user_id, name=name, description=description,
        circuit_json=circuit_json, status="in_progress",
    )
    db.session.add(project)
    db.session.commit()
    return jsonify({"project": project.to_dict(viewer_id=user_id)}), 201


@projects_bp.get("/<int:project_id>")
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = _accessible_project(project_id, user_id)
    if not project:
        # not owned/shared with this user - but anyone can view a public one, read-only
        project = Project.query.filter_by(id=project_id, is_public=True).first()
    if not project:
        return jsonify({"error": "Project not found."}), 404
    return jsonify({"project": project.to_dict(viewer_id=user_id)}), 200


@projects_bp.put("/<int:project_id>")
@jwt_required()
def update_project(project_id):
    user_id = get_jwt_identity()
    project = _accessible_project(project_id, user_id)
    if not project:
        return jsonify({"error": "Project not found."}), 404

    data = request.get_json(silent=True) or {}
    if "name" in data:
        project.name = (data["name"] or "Untitled Circuit").strip()[:120]
    if "description" in data:
        project.description = (data["description"] or "").strip()[:2000]
    if "circuit_json" in data:
        project.circuit_json = data["circuit_json"]
    if "status" in data and data["status"] in ("in_progress", "completed", "error"):
        project.status = data["status"]
    if "is_public" in data:
        project.is_public = bool(data["is_public"])

    db.session.commit()
    return jsonify({"project": project.to_dict(viewer_id=user_id)}), 200


@projects_bp.delete("/<int:project_id>")
@jwt_required()
def delete_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({"error": "Project not found, or you don't own it."}), 404
    ProjectCollaborator.query.filter_by(project_id=project_id).delete()
    db.session.delete(project)
    db.session.commit()
    return jsonify({"deleted": True}), 200


# --- Collaborators: shared access from another account/device. Owner-only
# to manage; any collaborator can open/edit/save the circuit itself. ---

@projects_bp.get("/<int:project_id>/collaborators")
@jwt_required()
def list_collaborators(project_id):
    user_id = get_jwt_identity()
    project = _accessible_project(project_id, user_id)
    if not project:
        return jsonify({"error": "Project not found."}), 404
    items = ProjectCollaborator.query.filter_by(project_id=project_id).all()
    return jsonify({"collaborators": [c.to_dict() for c in items]}), 200


@projects_bp.delete("/<int:project_id>/collaborators/<int:collaborator_id>")
@jwt_required()
def remove_collaborator(project_id, collaborator_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({"error": "Project not found, or only the owner can remove collaborators."}), 404

    collab = ProjectCollaborator.query.filter_by(id=collaborator_id, project_id=project_id).first()
    if not collab:
        return jsonify({"error": "Collaborator not found."}), 404
    db.session.delete(collab)
    db.session.commit()
    return jsonify({"deleted": True}), 200


# --- Share requests: sending an invite doesn't grant access immediately -
# the recipient has to accept it first (see invites.py for accept/decline). ---

@projects_bp.get("/<int:project_id>/invites")
@jwt_required()
def list_project_invites(project_id):
    user_id = get_jwt_identity()
    project = _accessible_project(project_id, user_id)
    if not project:
        return jsonify({"error": "Project not found."}), 404
    items = ProjectInvite.query.filter_by(project_id=project_id, status="pending").all()
    return jsonify({"invites": [i.to_dict() for i in items]}), 200


@projects_bp.post("/<int:project_id>/invites")
@jwt_required()
def send_invite(project_id):
    user_id = get_jwt_identity()
    project = _accessible_project(project_id, user_id)
    if not project:
        return jsonify({"error": "Project not found."}), 404

    data = request.get_json(silent=True) or {}
    # ShareModal.jsx sends { username }, not { email } - match that here.
    username = (data.get("username") or "").strip().lower()
    if not username:
        return jsonify({"error": "Enter a username."}), 400

    target = User.query.filter(db.func.lower(User.username) == username).first()
    if not target:
        return jsonify({"error": "No CircuitLab account with that username. They need to register first."}), 404
    if str(target.id) == str(user_id):
        return jsonify({"error": "That's your own account."}), 400

    already_collab = ProjectCollaborator.query.filter_by(project_id=project_id, user_id=target.id).first()
    if already_collab:
        return jsonify({"error": f"{target.name} already has access."}), 409

    existing_invite = ProjectInvite.query.filter_by(project_id=project_id, to_user_id=target.id).first()
    if existing_invite:
        if existing_invite.status == "pending":
            return jsonify({"error": f"{target.name} already has a pending invite for this circuit."}), 409
        # they declined (or an old accepted one somehow lost its collaborator row) - let this resend
        existing_invite.status = "pending"
        existing_invite.from_user_id = user_id
        existing_invite.created_at = datetime.now(timezone.utc)
        existing_invite.responded_at = None
        db.session.commit()
        return jsonify({"invite": existing_invite.to_dict()}), 201

    invite = ProjectInvite(project_id=project_id, from_user_id=user_id, to_user_id=target.id)
    db.session.add(invite)
    db.session.commit()
    return jsonify({"invite": invite.to_dict()}), 201