from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, ProjectCollaborator, ProjectInvite

invites_bp = Blueprint("invites", __name__, url_prefix="/api/invites")


@invites_bp.get("")
@jwt_required()
def list_my_invites():
    """Pending invites addressed to me - this is what the notification bell polls."""
    user_id = get_jwt_identity()
    items = (
        ProjectInvite.query.filter_by(to_user_id=user_id, status="pending")
        .order_by(ProjectInvite.created_at.desc())
        .all()
    )
    return jsonify({"invites": [i.to_dict() for i in items]}), 200


@invites_bp.post("/<int:invite_id>/accept")
@jwt_required()
def accept_invite(invite_id):
    user_id = get_jwt_identity()
    invite = ProjectInvite.query.filter_by(id=invite_id, to_user_id=user_id, status="pending").first()
    if not invite:
        return jsonify({"error": "Invite not found, or it's already been responded to."}), 404

    invite.status = "accepted"
    invite.responded_at = datetime.now(timezone.utc)

    already = ProjectCollaborator.query.filter_by(project_id=invite.project_id, user_id=user_id).first()
    if not already:
        db.session.add(ProjectCollaborator(project_id=invite.project_id, user_id=user_id))

    db.session.commit()
    return jsonify({"accepted": True, "project_id": invite.project_id}), 200


@invites_bp.post("/<int:invite_id>/decline")
@jwt_required()
def decline_invite(invite_id):
    user_id = get_jwt_identity()
    invite = ProjectInvite.query.filter_by(id=invite_id, to_user_id=user_id, status="pending").first()
    if not invite:
        return jsonify({"error": "Invite not found, or it's already been responded to."}), 404

    invite.status = "declined"
    invite.responded_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"declined": True}), 200