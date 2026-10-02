import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class BoardShare(Base):
    __tablename__ = "board_shares"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    board_id = Column(String(36), ForeignKey("boards.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    permission = Column(String(20), default="view", nullable=False) # 'view' or 'edit'
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    board = relationship("Board", back_populates="shares")

    def to_dict(self):
        return {
            "id": self.id,
            "boardId": self.board_id,
            "token": self.token,
            "permission": self.permission,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
