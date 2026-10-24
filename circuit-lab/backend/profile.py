from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

from models import db, User, Follow, Project

profile_bp = Blueprint("profile", __name__, url_prefix="/api")


def _optional_viewer_id():
    # Profile pages are public, but we still want to show "already
    # following" state if the visitor happens to be logged in.
    try:
        verify_jwt_in_request(optional=True)
        return get_jwt_identity()
    except Exception:
        return None


@profile_bp.get("/users/search")
def search_users():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"users": []}), 200

    matches = (
        User.query.filter(User.username.ilike(f"%{q}%"))
        .order_by(User.username)
        .limit(20)
        .all()
    )
    viewer_id = _optional_viewer_id()
    return jsonify({"users": [u.to_public_dict(viewer_id) for u in matches]}), 200


@profile_bp.get("/users/<username>")
def get_profile(username):
    user = User.query.filter_by(username=username.strip().lower()).first()
    if not user:
        return jsonify({"error": "User not found."}), 404
    viewer_id = _optional_viewer_id()
    return jsonify({"user": user.to_public_dict(viewer_id)}), 200


@profile_bp.get("/users/<username>/projects")
def get_profile_projects(username):
    user = User.query.filter_by(username=username.strip().lower()).first()
    if not user:
        return jsonify({"error": "User not found."}), 404
    viewer_id = _optional_viewer_id()
    projects = (
        Project.query.filter_by(user_id=user.id, is_public=True)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return jsonify({"projects": [p.to_community_dict(viewer_id) for p in projects]}), 200


@profile_bp.get("/users/<username>/followers")
def get_followers(username):
    user = User.query.filter_by(username=username.strip().lower()).first()
    if not user:
        return jsonify({"error": "User not found."}), 404
    viewer_id = _optional_viewer_id()
    follows = Follow.query.filter_by(followee_id=user.id).order_by(Follow.created_at.desc()).all()
    users = [User.query.get(f.follower_id) for f in follows]
    return jsonify({"users": [u.to_public_dict(viewer_id) for u in users if u]}), 200


@profile_bp.get("/users/<username>/following")
def get_following(username):
    user = User.query.filter_by(username=username.strip().lower()).first()
    if not user:
        return jsonify({"error": "User not found."}), 404
    viewer_id = _optional_viewer_id()
    follows = Follow.query.filter_by(follower_id=user.id).order_by(Follow.created_at.desc()).all()
    users = [User.query.get(f.followee_id) for f in follows]
    return jsonify({"users": [u.to_public_dict(viewer_id) for u in users if u]}), 200


@profile_bp.post("/users/<username>/follow")
@jwt_required()
def toggle_follow(username):
    viewer_id = int(get_jwt_identity())
    target = User.query.filter_by(username=username.strip().lower()).first()
    if not target:
        return jsonify({"error": "User not found."}), 404
    if target.id == viewer_id:
        return jsonify({"error": "You can't follow yourself."}), 400

    existing = Follow.query.filter_by(follower_id=viewer_id, followee_id=target.id).first()
    if existing:
        db.session.delete(existing)
        following = False
    else:
        db.session.add(Follow(follower_id=viewer_id, followee_id=target.id))
        following = True
    db.session.commit()

    follower_count = Follow.query.filter_by(followee_id=target.id).count()
    return jsonify({"following": following, "follower_count": follower_count}), 200


@profile_bp.patch("/users/me/bio")
@jwt_required()
def update_bio():
    viewer_id = int(get_jwt_identity())
    user = User.query.get(viewer_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    bio = (data.get("bio") or "").strip()[:280]
    user.bio = bio
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200