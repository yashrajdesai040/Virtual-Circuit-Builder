from datetime import datetime, timezone
from models import db


class Component(db.Model):
    __tablename__ = "components"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(40), unique=True, nullable=False)  # e.g. "resistor"
    name = db.Column(db.String(80), nullable=False)
    category = db.Column(db.String(40), nullable=False)  # passive | active | source | control
    description = db.Column(db.Text, nullable=False)
    model_type = db.Column(db.String(40), nullable=False)  # which 3D builder3d the frontend uses
    unit = db.Column(db.String(20))  # Ω, F, V, A...
    default_value = db.Column(db.Float)
    terminal_count = db.Column(db.Integer, default=2)
    spec = db.Column(db.JSON, default=dict)  # tolerance, voltage rating, notes, etc.
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "model_type": self.model_type,
            "unit": self.unit,
            "default_value": self.default_value,
            "terminal_count": self.terminal_count,
            "spec": self.spec or {},
        }
