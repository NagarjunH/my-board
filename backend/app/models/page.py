import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Page(Base):
    __tablename__ = "pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    board_id = Column(String(36), ForeignKey("boards.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    position = Column(Integer, default=0, nullable=False)
    canvas_state = Column(JSON, default=dict)
    background_config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    board = relationship("Board", back_populates="pages")

    def to_dict(self):
        return {
            "id": self.id,
            "boardId": self.board_id,
            "name": self.name,
            "position": self.position,
            "canvasState": self.canvas_state or {"elements": [], "viewport": {"x": 0, "y": 0, "zoom": 1}},
            "backgroundConfig": self.background_config or {"style": "white"},
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
