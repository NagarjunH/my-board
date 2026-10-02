from datetime import datetime, timezone
from flask import Blueprint, jsonify
from app.models import BoardShare, Board

share_bp = Blueprint("share", __name__, url_prefix="/api/share")

@share_bp.route("/<string:token>", methods=["GET"])
def get_shared_board(token):
    from app import db_session
    share = db_session.query(BoardShare).filter_by(token=token).first()
    if not share:
        return jsonify({"error": "Not Found", "message": "Shared board not found or link is invalid"}), 404

    if share.expires_at and share.expires_at < datetime.now(timezone.utc):
        return jsonify({"error": "Gone", "message": "This share link has expired"}), 410

    board = db_session.query(Board).filter_by(id=share.board_id).first()
    if not board:
        return jsonify({"error": "Not Found", "message": "Board not found"}), 404

    # Sanitize user details
    board_data = board.to_dict(include_pages=True)
    return jsonify({
        "board": board_data,
        "permission": share.permission
    }), 200
