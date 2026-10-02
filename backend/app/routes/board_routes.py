import uuid
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, g
from app.models import Board, Page, BoardShare
from app.auth.decorators import require_auth

board_bp = Blueprint("boards", __name__, url_prefix="/api/boards")

@board_bp.route("", methods=["GET"])
@require_auth
def get_boards():
    from app import db_session
    boards = db_session.query(Board).filter_by(user_id=g.current_user_id).order_by(Board.updated_at.desc()).all()
    return jsonify({"boards": [b.to_dict(include_pages=True) for b in boards]}), 200

@board_bp.route("", methods=["POST"])
@require_auth
def create_board():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()

    if not name:
        return jsonify({"error": "Bad Request", "message": "Board name is required"}), 400

    from app import db_session
    board = Board(
        user_id=g.current_user_id,
        name=name,
        description=description
    )
    db_session.add(board)
    db_session.flush()

    # Create default first lesson page
    first_page = Page(
        board_id=board.id,
        name="01. Lesson Overview",
        position=0,
        canvas_state={"elements": [], "viewport": {"x": 0, "y": 0, "zoom": 1}},
        background_config={"style": "white"}
    )
    db_session.add(first_page)
    db_session.commit()

    return jsonify({"board": board.to_dict(include_pages=True)}), 201

@board_bp.route("/<string:board_id>", methods=["GET"])
@require_auth
def get_board(board_id):
    from app import db_session
    board = db_session.query(Board).filter_by(id=board_id, user_id=g.current_user_id).first()
    if not board:
        return jsonify({"error": "Not Found", "message": "Board not found or access denied"}), 404
    return jsonify({"board": board.to_dict(include_pages=True)}), 200

@board_bp.route("/<string:board_id>", methods=["PATCH"])
@require_auth
def update_board(board_id):
    from app import db_session
    board = db_session.query(Board).filter_by(id=board_id, user_id=g.current_user_id).first()
    if not board:
        return jsonify({"error": "Not Found", "message": "Board not found or access denied"}), 404

    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        board.name = data["name"].strip()
    if "description" in data:
        board.description = data["description"].strip()
    if "isFavorite" in data:
        board.is_favorite = bool(data["isFavorite"])

    db_session.commit()
    return jsonify({"board": board.to_dict(include_pages=True)}), 200

@board_bp.route("/<string:board_id>", methods=["DELETE"])
@require_auth
def delete_board(board_id):
    from app import db_session
    board = db_session.query(Board).filter_by(id=board_id, user_id=g.current_user_id).first()
    if not board:
        return jsonify({"error": "Not Found", "message": "Board not found or access denied"}), 404

    db_session.delete(board)
    db_session.commit()
    return jsonify({"success": True, "message": "Board deleted successfully"}), 200

@board_bp.route("/<string:board_id>/share", methods=["POST"])
@require_auth
def share_board(board_id):
    from app import db_session
    board = db_session.query(Board).filter_by(id=board_id, user_id=g.current_user_id).first()
    if not board:
        return jsonify({"error": "Not Found", "message": "Board not found or access denied"}), 404

    data = request.get_json() or {}
    permission = data.get("permission", "view")
    expires_in_days = data.get("expires_in_days")

    expires_at = None
    if expires_in_days and isinstance(expires_in_days, int):
        expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)

    token = uuid.uuid4().hex[:12]
    share = BoardShare(
        board_id=board.id,
        token=token,
        permission=permission,
        expires_at=expires_at
    )
    db_session.add(share)
    db_session.commit()

    return jsonify({
        "share": share.to_dict(),
        "shareUrl": f"/share/{token}"
    }), 201
