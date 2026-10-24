import re
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,20}$")
# 8-20 chars, at least one uppercase, one lowercase, one number, one special char
PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$")
PASSWORD_HINT = (
    "Password must be 8-20 characters and include an uppercase letter, "
    "a lowercase letter, a number, and a special character."
)

# Registration no longer collects a real email address, but the users
# table still requires a unique, non-null email (other features like
# collaborator/invite lists display it). We generate a stable placeholder
# from the username instead of asking the user for one or migrating the
# schema. Since username is already unique, this stays unique too.
PLACEHOLDER_EMAIL_DOMAIN = "users.circuitlab.local"


def _placeholder_email(username):
    return f"{username}@{PLACEHOLDER_EMAIL_DOMAIN}"


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    print(f"[register] raw data received: {data!r}")
    name = (data.get("name") or "").strip()
    username = (data.get("username") or "").strip().lower()
    password = (data.get("password") or "").strip()
    print(f"[register] parsed -> name={name!r} username={username!r} password={password!r}")

    if not name or len(name) < 2:
        return jsonify({"error": "Name must be at least 2 characters."}), 400
    if not USERNAME_RE.match(username):
        return jsonify({"error": "Username must be 3-20 characters: letters, numbers, and underscores only."}), 400
    if not PASSWORD_RE.match(password):
        return jsonify({"error": PASSWORD_HINT}), 400

    existing = User.query.filter_by(username=username).first()
    if existing:
        return jsonify({"error": "That username is already taken."}), 409

    user = User(
        name=name,
        username=username,
        email=_placeholder_email(username),
        is_verified=True,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("username") or data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if EMAIL_RE.match(identifier):
        user = User.query.filter_by(email=identifier).first()
    else:
        user = User.query.filter_by(username=identifier).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password."}), 401

    if not user.is_verified:
        return jsonify({"error": "This account is not verified. Please contact support."}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200
