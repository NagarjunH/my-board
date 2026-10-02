from flask import Blueprint, request, jsonify, send_from_directory, g
from app.storage.s3_storage import storage_service
from app.auth.decorators import require_auth
from config import Config

asset_bp = Blueprint("assets", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@asset_bp.route("/api/assets/upload", methods=["POST"])
def upload_asset():
    if "file" not in request.files:
        return jsonify({"error": "Bad Request", "message": "No file field in form data"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Bad Request", "message": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported Media Type", "message": "Only PNG, JPG, GIF, WebP, and SVG images are allowed"}), 415

    try:
        url = storage_service.upload_file(file)
        return jsonify({"url": url, "filename": file.filename}), 201
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@asset_bp.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)
