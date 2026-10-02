import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.models.base import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    board_id = Column(String(36), ForeignKey("boards.id", ondelete="SET NULL"), nullable=True, index=True)
    file_url = Column(String(1000), nullable=False)
    file_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "boardId": self.board_id,
            "fileUrl": self.file_url,
            "fileType": self.file_type,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
