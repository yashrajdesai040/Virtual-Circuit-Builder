from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    username = db.Column(db.String(30), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Email verification via OTP - unverified accounts can't log in yet.
    is_verified = db.Column(db.Boolean, default=False)
    otp_code = db.Column(db.String(6))
    otp_expires_at = db.Column(db.DateTime)
    otp_last_sent_at = db.Column(db.DateTime)

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "email": self.email,
            "bio": self.bio or "",
            "created_at": self.created_at.isoformat(),
        }

    def to_public_dict(self, viewer_id=None):
        # Used on profile pages / search results / follower lists -
        # deliberately leaves out email, unlike to_dict().
        follower_count = Follow.query.filter_by(followee_id=self.id).count()
        following_count = Follow.query.filter_by(follower_id=self.id).count()
        project_count = Project.query.filter_by(user_id=self.id, is_public=True).count()
        is_following = (
            viewer_id is not None
            and Follow.query.filter_by(follower_id=int(viewer_id), followee_id=self.id).first() is not None
        )
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "bio": self.bio or "",
            "follower_count": follower_count,
            "following_count": following_count,
            "project_count": project_count,
            "is_following": is_following,
            "is_me": viewer_id is not None and int(viewer_id) == self.id,
            "created_at": self.created_at.isoformat(),
        }


# --- Following: lets one user follow another. Directional - if A follows B,
# that does not mean B follows A. ---

class Follow(db.Model):
    __tablename__ = "follows"
    __table_args__ = (db.UniqueConstraint("follower_id", "followee_id", name="uq_follow_pair"),)

    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    followee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


# --- Project: circuits users build. circuit_json holds the react-flow graph. ---

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, default="")
    status = db.Column(db.String(20), default="in_progress")  # in_progress | completed | error
    circuit_json = db.Column(db.JSON, default=dict)  # { nodes: [...], edges: [...] }

    # populated by the simulate endpoint each time "Run circuit" is used -
    # real data, not estimated/fabricated stats
    last_run_status = db.Column(db.String(20))  # complete | open | short | no_source | None (never run)
    last_run_at = db.Column(db.DateTime)
    run_count = db.Column(db.Integer, default=0)

    is_public = db.Column(db.Boolean, default=False)  # shared to the community gallery

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self, viewer_id=None):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description or "",
            "status": self.status,
            "circuit_json": self.circuit_json or {"nodes": [], "edges": []},
            "last_run_status": self.last_run_status,
            "last_run_at": self.last_run_at.isoformat() if self.last_run_at else None,
            "run_count": self.run_count or 0,
            "is_public": bool(self.is_public),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_owner": (viewer_id is not None and int(viewer_id) == self.user_id),
        }

    def to_community_dict(self, viewer_id=None):
        owner = User.query.get(self.user_id)
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description or "",
            "owner_name": owner.name if owner else "Unknown",
            "owner_username": owner.username if owner else "",
            "component_count": len((self.circuit_json or {}).get("nodes", [])),
            "last_run_status": self.last_run_status,
            "like_count": ProjectLike.query.filter_by(project_id=self.id).count(),
            "comment_count": ProjectComment.query.filter_by(project_id=self.id).count(),
            "liked_by_me": (
                viewer_id is not None
                and ProjectLike.query.filter_by(project_id=self.id, user_id=viewer_id).first() is not None
            ),
            "created_at": self.created_at.isoformat(),
        }


# --- Shared access: lets other registered users open/edit/save the same
# circuit from their own account/device. Not real-time co-editing - it's
# shared database access, so the usual "last save wins" rule applies. ---

class ProjectCollaborator(db.Model):
    __tablename__ = "project_collaborators"
    __table_args__ = (db.UniqueConstraint("project_id", "user_id", name="uq_project_user"),)

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    added_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        user = User.query.get(self.user_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": user.name if user else "Unknown",
            "email": user.email if user else "",
            "added_at": self.added_at.isoformat(),
        }


# --- Community: public gallery, likes, comments. Only projects the owner has
# explicitly marked is_public=True show up here for anyone to browse. ---

class ProjectLike(db.Model):
    __tablename__ = "project_likes"
    __table_args__ = (db.UniqueConstraint("project_id", "user_id", name="uq_like_project_user"),)

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class ProjectComment(db.Model):
    __tablename__ = "project_comments"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self, viewer_id=None):
        user = User.query.get(self.user_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "author_name": user.name if user else "Unknown",
            "body": self.body,
            "created_at": self.created_at.isoformat(),
            "is_mine": viewer_id is not None and int(viewer_id) == self.user_id,
        }


# --- Share requests: sending someone an invite doesn't grant access by
# itself - they have to accept it first. Powers the notification bell. ---

class ProjectInvite(db.Model):
    __tablename__ = "project_invites"
    __table_args__ = (db.UniqueConstraint("project_id", "to_user_id", name="uq_invite_project_user"),)

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    to_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending | accepted | declined
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    responded_at = db.Column(db.DateTime)

    def to_dict(self):
        project = Project.query.get(self.project_id)
        sender = User.query.get(self.from_user_id)
        recipient = User.query.get(self.to_user_id)
        return {
            "id": self.id,
            "project_id": self.project_id,
            "project_name": project.name if project else "Untitled Circuit",
            "from_user_id": self.from_user_id,
            "from_name": sender.name if sender else "Unknown",
            "from_username": sender.username if sender else "",
            "to_user_id": self.to_user_id,
            "to_name": recipient.name if recipient else "Unknown",
            "to_username": recipient.username if recipient else "",
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }