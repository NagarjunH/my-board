import os
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename
from config import Config

class StorageService:
    def __init__(self):
        self.use_s3 = bool(Config.AWS_S3_BUCKET and Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY)
        self.s3_client = None

        if self.use_s3:
            try:
                import boto3
                kwargs = {
                    "aws_access_key_id": Config.AWS_ACCESS_KEY_ID,
                    "aws_secret_access_key": Config.AWS_SECRET_ACCESS_KEY,
                    "region_name": Config.AWS_REGION,
                }
                if Config.AWS_S3_ENDPOINT_URL:
                    kwargs["endpoint_url"] = Config.AWS_S3_ENDPOINT_URL

                self.s3_client = boto3.client("s3", **kwargs)
            except Exception as e:
                print(f"Warning: Failed to initialize AWS S3 client ({e}). Falling back to local storage.")
                self.use_s3 = False

        if not self.use_s3:
            Path(Config.UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

    def upload_file(self, file_storage) -> str:
        """
        Uploads an image or file and returns a public accessible URL.
        """
        filename = secure_filename(file_storage.filename or "upload")
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "png"
        unique_name = f"{uuid.uuid4().hex}.{ext}"

        if self.use_s3 and self.s3_client:
            try:
                content_type = file_storage.content_type or "application/octet-stream"
                self.s3_client.upload_fileobj(
                    file_storage,
                    Config.AWS_S3_BUCKET,
                    unique_name,
                    ExtraArgs={"ContentType": content_type}
                )
                if Config.AWS_S3_ENDPOINT_URL:
                    return f"{Config.AWS_S3_ENDPOINT_URL}/{Config.AWS_S3_BUCKET}/{unique_name}"
                return f"https://{Config.AWS_S3_BUCKET}.s3.{Config.AWS_REGION}.amazonaws.com/{unique_name}"
            except Exception as e:
                print(f"S3 upload error: {e}. Falling back to local disk storage.")

        # Local storage fallback
        dest_path = os.path.join(Config.UPLOAD_FOLDER, unique_name)
        file_storage.seek(0)
        file_storage.save(dest_path)
        return f"/uploads/{unique_name}"

storage_service = StorageService()
