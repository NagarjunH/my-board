from flask import Blueprint, request, jsonify, g
from app.models import Board, Page
from app.auth.decorators import require_auth

page_bp = Blueprint("pages", __name__, url_prefix="/api")

@page_bp.route("/boards/<string:board_id>/pages", methods=["GET"])
@require_auth
def get_pages(board_id):
    from app import db_session
    board = db_session.query(Board).filter_by(id=board_id, user_id=g.current_user_id).first()
    if not board:
        return jsonify({"error": "Not Found", "message": "Board not found or access denied"}), 404

    pages = db_session.query(Page).filter_by(board_id=board_id).order_by(Page.position).all()
    return jsonify({"pages": [p.to_dict() for p in pages]}), 200

@page_bp.route("/boards/<string:board_id>/pages", methods=["POST"])
@require_auth
def create_page(board_id):
    from app import db_session
    board = db_session.query(Board).filter_by(id=board_id, user_id=g.current_user_id).first()
    if not board:
        return jsonify({"error": "Not Found", "message": "Board not found or access denied"}), 404

    data = request.get_json() or {}
    name = data.get("name", "").strip() or "Untitled Lesson"
    count = db_session.query(Page).filter_by(board_id=board_id).count()
    position = data.get("position", count)

    page = Page(
        board_id=board.id,
        name=name,
        position=position,
        canvas_state=data.get("canvas_state", {"elements": [], "viewport": {"x": 0, "y": 0, "zoom": 1}}),
        background_config=data.get("background_config", {"style": "white"})
    )
    db_session.add(page)
    db_session.commit()

    return jsonify({"page": page.to_dict()}), 201

@page_bp.route("/pages/<string:page_id>", methods=["GET"])
@require_auth
def get_page(page_id):
    from app import db_session
    page = db_session.query(Page).join(Board).filter(Page.id == page_id, Board.user_id == g.current_user_id).first()
    if not page:
        return jsonify({"error": "Not Found", "message": "Page not found or access denied"}), 404
    return jsonify({"page": page.to_dict()}), 200

@page_bp.route("/pages/<string:page_id>", methods=["PATCH"])
@require_auth
def update_page(page_id):
    from app import db_session
    page = db_session.query(Page).join(Board).filter(Page.id == page_id, Board.user_id == g.current_user_id).first()
    if not page:
        return jsonify({"error": "Not Found", "message": "Page not found or access denied"}), 404

    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        page.name = data["name"].strip()
    if "position" in data:
        page.position = data["position"]
    if "canvas_state" in data:
        page.canvas_state = data["canvas_state"]
    if "background_config" in data:
        page.background_config = data["background_config"]

    db_session.commit()
    return jsonify({"page": page.to_dict()}), 200

@page_bp.route("/pages/<string:page_id>", methods=["DELETE"])
@require_auth
def delete_page(page_id):
    from app import db_session
    page = db_session.query(Page).join(Board).filter(Page.id == page_id, Board.user_id == g.current_user_id).first()
    if not page:
        return jsonify({"error": "Not Found", "message": "Page not found or access denied"}), 404

    # Ensure at least 1 page remains in board
    board_page_count = db_session.query(Page).filter_by(board_id=page.board_id).count()
    if board_page_count <= 1:
        return jsonify({"error": "Forbidden", "message": "Cannot delete the only page in a board"}), 400

    db_session.delete(page)
    db_session.commit()
    return jsonify({"success": True, "message": "Page deleted successfully"}), 200
