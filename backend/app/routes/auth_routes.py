from flask import Blueprint, request, jsonify, g
from app.models import User
from app.auth.jwt_handler import generate_token
from app.auth.decorators import require_auth

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Bad Request", "message": "Name, email, and password are required"}), 400

    from app import db_session
    existing = db_session.query(User).filter_by(email=email).first()
    if existing:
        return jsonify({"error": "Conflict", "message": "User with this email already exists"}), 409

    user = User(name=name, email=email)
    user.set_password(password)
    db_session.add(user)
    db_session.commit()

    token = generate_token(user.id, user.email)
    return jsonify({
        "message": "User registered successfully",
        "user": user.to_dict(),
        "token": token
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    from app import db_session
    user = db_session.query(User).filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Unauthorized", "message": "Invalid email or password"}), 401

    token = generate_token(user.id, user.email)
    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "token": token
    }), 200

@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_current_user():
    from app import db_session
    user = db_session.query(User).filter_by(id=g.current_user_id).first()
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200
