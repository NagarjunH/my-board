from functools import wraps
from flask import request, jsonify, g
from app.auth.jwt_handler import decode_token

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Unauthorized", "message": "Authorization header missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Unauthorized", "message": "Invalid Authorization header format"}), 401

        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Unauthorized", "message": "Invalid or expired token"}), 401

        g.current_user_id = payload.get("sub")
        g.current_user_email = payload.get("email")
        return f(*args, **kwargs)

    return decorated
