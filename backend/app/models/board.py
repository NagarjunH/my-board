import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Board(Base):
    __tablename__ = "boards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True, default="")
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    pages = relationship("Page", back_populates="board", cascade="all, delete-orphan", order_by="Page.position")
    shares = relationship("BoardShare", back_populates="board", cascade="all, delete-orphan")

    def to_dict(self, include_pages=True):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "name": self.name,
            "description": self.description,
            "isFavorite": self.is_favorite,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_pages:
            data["pages"] = [page.to_dict() for page in self.pages]
        return data
