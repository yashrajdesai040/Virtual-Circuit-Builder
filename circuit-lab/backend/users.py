from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User, Follow, Project

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.get("/<string:username>")
@jwt_required(optional=True)
def get_profile(username):
    viewer_id = get_jwt_identity()
    user = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    if not user:
        return jsonify({"error": "No profile found for that username."}), 404
    return jsonify({"user": user.to_public_dict(viewer_id=viewer_id)}), 200


@users_bp.get("/<string:username>/projects")
@jwt_required(optional=True)
def get_profile_projects(username):
    viewer_id = get_jwt_identity()
    user = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    if not user:
        return jsonify({"error": "No profile found for that username."}), 404

    projects = (
        Project.query.filter_by(user_id=user.id, is_public=True)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return jsonify({"projects": [p.to_community_dict(viewer_id=viewer_id) for p in projects]}), 200


@users_bp.get("/<string:username>/followers")
@jwt_required(optional=True)
def get_followers(username):
    viewer_id = get_jwt_identity()
    user = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    if not user:
        return jsonify({"error": "No profile found for that username."}), 404

    rows = Follow.query.filter_by(followee_id=user.id).all()
    people = [User.query.get(r.follower_id) for r in rows]
    return jsonify({"users": [p.to_public_dict(viewer_id=viewer_id) for p in people if p]}), 200


@users_bp.get("/<string:username>/following")
@jwt_required(optional=True)
def get_following(username):
    viewer_id = get_jwt_identity()
    user = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    if not user:
        return jsonify({"error": "No profile found for that username."}), 404

    rows = Follow.query.filter_by(follower_id=user.id).all()
    people = [User.query.get(r.followee_id) for r in rows]
    return jsonify({"users": [p.to_public_dict(viewer_id=viewer_id) for p in people if p]}), 200


@users_bp.post("/<string:username>/follow")
@jwt_required()
def toggle_follow(username):
    viewer_id = int(get_jwt_identity())
    target = User.query.filter(db.func.lower(User.username) == username.lower()).first()
    if not target:
        return jsonify({"error": "No profile found for that username."}), 404
    if target.id == viewer_id:
        return jsonify({"error": "You can't follow yourself."}), 400

    existing = Follow.query.filter_by(follower_id=viewer_id, followee_id=target.id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        following = False
    else:
        db.session.add(Follow(follower_id=viewer_id, followee_id=target.id))
        db.session.commit()
        following = True

    follower_count = Follow.query.filter_by(followee_id=target.id).count()
    return jsonify({"following": following, "follower_count": follower_count}), 200


@users_bp.patch("/me/bio")
@jwt_required()
def update_bio():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    bio = (data.get("bio") or "").strip()[:280]
    user.bio = bio
    db.session.commit()
    return jsonify({"bio": user.bio}), 200


@users_bp.get("/search")
@jwt_required(optional=True)
def search_users():
    """Powers PeopleSearch.jsx - GET /api/users/search?q=..."""
    viewer_id = get_jwt_identity()
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"users": []}), 200

    matches = (
        User.query.filter(
            db.or_(
                User.username.ilike(f"%{q}%"),
                User.name.ilike(f"%{q}%"),
            )
        )
        .limit(20)
        .all()
    )
    return jsonify({"users": [u.to_public_dict(viewer_id=viewer_id) for u in matches]}), 200