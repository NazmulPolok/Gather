from pathlib import Path
from fastapi import HTTPException

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_image_file(contents: bytes, content_type: str) -> str:
    """Validates image MIME type, file size, and file magic bytes. Returns the verified extension."""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPEG, PNG, WebP, or GIF.",
        )
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size too large. Maximum size is 10MB.",
        )

    # Magic byte verification to prevent MIME-spoofing and executable upload attacks
    if content_type == "image/jpeg" and not contents.startswith(b"\xff\xd8\xff"):
        raise HTTPException(status_code=400, detail="Invalid JPEG image data.")
    elif content_type == "image/png" and not contents.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(status_code=400, detail="Invalid PNG image data.")
    elif content_type == "image/gif" and not (contents.startswith(b"GIF87a") or contents.startswith(b"GIF89a")):
        raise HTTPException(status_code=400, detail="Invalid GIF image data.")
    elif content_type == "image/webp" and not (
        contents.startswith(b"RIFF") and len(contents) >= 12 and contents[8:12] == b"WEBP"
    ):
        raise HTTPException(status_code=400, detail="Invalid WebP image data.")

    return ALLOWED_IMAGE_TYPES[content_type]


def safe_delete_upload_file(base_dir: Path, url_path: str | None, prefix: str) -> None:
    """Safely deletes an uploaded file from disk, strictly preventing path traversal attacks."""
    if not url_path or not url_path.startswith(prefix):
        return
    try:
        filename = Path(url_path.removeprefix(prefix)).name
        target = (base_dir / filename).resolve()
        if target.is_file() and target.is_relative_to(base_dir.resolve()):
            target.unlink(missing_ok=True)
    except Exception:
        pass
