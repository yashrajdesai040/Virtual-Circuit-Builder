from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db
from auth import auth_bp
from components import components_bp
from projects import projects_bp
from invites import invites_bp
from users import users_bp
from Simulate import simulate_bp
from community import community_bp
from component_model import Component  # noqa: F401 - registers table with SQLAlchemy
from seed import seed_components


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    app.register_blueprint(auth_bp)
    app.register_blueprint(components_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(invites_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(simulate_bp)
    app.register_blueprint(community_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()
        seed_components()

    return app


app = create_app()

if __name__ == "__main__":
    # use_reloader=False: OneDrive-synced folders touch file timestamps
    # constantly, which fools Flask's file-watcher into restarting the
    # server mid-request. Debug mode (nice tracebacks) still works fine.
    app.run(debug=True, use_reloader=False, port=5000)