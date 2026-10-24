from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, Project, ProjectLike, ProjectComment

community_bp = Blueprint("community", __name__, url_prefix="/api/community")

MAX_COMMENT_LENGTH = 500


@community_bp.get("/projects")
@jwt_required()
def browse_projects():
    user_id = get_jwt_identity()
    query = (request.args.get("q") or "").strip().lower()

    q = Project.query.filter_by(is_public=True)
    if query:
        like = f"%{query}%"
        q = q.filter(db.or_(Project.name.ilike(like), Project.description.ilike(like)))

    projects = q.order_by(Project.updated_at.desc()).all()
    items = [p.to_community_dict(viewer_id=user_id) for p in projects]
    # most-liked first, ties broken by recency (already sorted above)
    items.sort(key=lambda p: p["like_count"], reverse=True)
    return jsonify({"projects": items}), 200


@community_bp.get("/projects/<int:project_id>")
@jwt_required()
def get_community_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, is_public=True).first()
    if not project:
        return jsonify({"error": "Project not found or not public."}), 404
    return jsonify({"project": project.to_community_dict(viewer_id=user_id)}), 200


@community_bp.post("/projects/<int:project_id>/like")
@jwt_required()
def toggle_like(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, is_public=True).first()
    if not project:
        return jsonify({"error": "Project not found or not public."}), 404

    existing = ProjectLike.query.filter_by(project_id=project_id, user_id=user_id).first()
    if existing:
        db.session.delete(existing)
        liked = False
    else:
        db.session.add(ProjectLike(project_id=project_id, user_id=user_id))
        liked = True
    db.session.commit()

    like_count = ProjectLike.query.filter_by(project_id=project_id).count()
    return jsonify({"liked": liked, "like_count": like_count}), 200


@community_bp.get("/projects/<int:project_id>/comments")
@jwt_required()
def list_comments(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, is_public=True).first()
    if not project:
        return jsonify({"error": "Project not found or not public."}), 404

    comments = (
        ProjectComment.query.filter_by(project_id=project_id)
        .order_by(ProjectComment.created_at.asc())
        .all()
    )
    return jsonify({"comments": [c.to_dict(viewer_id=user_id) for c in comments]}), 200


@community_bp.post("/projects/<int:project_id>/comments")
@jwt_required()
def add_comment(project_id):
    user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, is_public=True).first()
    if not project:
        return jsonify({"error": "Project not found or not public."}), 404

    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()[:MAX_COMMENT_LENGTH]
    if not body:
        return jsonify({"error": "Comment can't be empty."}), 400

    comment = ProjectComment(project_id=project_id, user_id=user_id, body=body)
    db.session.add(comment)
    db.session.commit()
    return jsonify({"comment": comment.to_dict(viewer_id=user_id)}), 201


@community_bp.delete("/comments/<int:comment_id>")
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    comment = ProjectComment.query.filter_by(id=comment_id, user_id=user_id).first()
    if not comment:
        return jsonify({"error": "Comment not found, or it isn't yours."}), 404
    db.session.delete(comment)
    db.session.commit()
    return jsonify({"deleted": True}), 200