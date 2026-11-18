import os
from pathlib import Path
import shutil
import subprocess
from fastapi import HTTPException

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

ALLOWED_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-matroska": ".mkv",
    "video/x-msvideo": ".avi",
    "video/avi": ".avi",
}

MAX_IMAGE_SIZE = 15 * 1024 * 1024   # 15MB
MAX_VIDEO_SIZE = 250 * 1024 * 1024  # 250MB


def get_ffmpeg_cmd() -> str | None:
    if shutil.which("ffmpeg"):
        return shutil.which("ffmpeg")
    # Check WinGet installation locations on Windows
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        winget_dir = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        if winget_dir.exists():
            for p in winget_dir.glob("**/ffmpeg.exe"):
                if p.is_file():
                    return str(p)
    return None


def validate_image_file(contents: bytes, content_type: str) -> str:
    """Validates image MIME type, file size, and file magic bytes. Returns verified extension."""
    ct = content_type.lower().split(";")[0].strip()
    if ct not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPEG, PNG, WebP, or GIF.",
        )
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image file size too large. Maximum size is 15MB.",
        )

    # Magic byte verification
    if ct == "image/jpeg" and not contents.startswith(b"\xff\xd8\xff"):
        raise HTTPException(status_code=400, detail="Invalid JPEG image data.")
    elif ct == "image/png" and not contents.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(status_code=400, detail="Invalid PNG image data.")
    elif ct == "image/gif" and not (contents.startswith(b"GIF87a") or contents.startswith(b"GIF89a")):
        raise HTTPException(status_code=400, detail="Invalid GIF image data.")
    elif ct == "image/webp" and not (
        contents.startswith(b"RIFF") and len(contents) >= 12 and contents[8:12] == b"WEBP"
    ):
        raise HTTPException(status_code=400, detail="Invalid WebP image data.")

    return ALLOWED_IMAGE_TYPES[ct]


def validate_video_file(contents: bytes, content_type: str) -> str:
    """Validates video MIME type, file size, and basic container header. Returns verified extension."""
    ct = content_type.lower().split(";")[0].strip()
    if ct not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported video format. Please upload MP4, WebM, MOV, or MKV.",
        )
    if len(contents) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Video file size too large. Maximum size is 250MB.",
        )

    # Basic container validation
    if ct in ("video/mp4", "video/quicktime"):
        if b"ftyp" not in contents[:64] and b"moov" not in contents[:64] and b"wide" not in contents[:64]:
            raise HTTPException(status_code=400, detail="Invalid MP4/MOV video data.")
    elif ct in ("video/webm", "video/x-matroska"):
        if not contents.startswith(b"\x1a\x45\xdf\xa3"):
            raise HTTPException(status_code=400, detail="Invalid WebM/MKV video data.")
    elif ct in ("video/avi", "video/x-msvideo"):
        if not (contents.startswith(b"RIFF") and len(contents) >= 12 and contents[8:12] == b"AVI "):
            raise HTTPException(status_code=400, detail="Invalid AVI video data.")

    return ALLOWED_VIDEO_TYPES[ct]


def optimize_video_to_1080p(raw_video_path: Path, output_mp4_path: Path) -> None:
    """
    Compresses and converts high-resolution videos (4K, 1440p, etc.) to 1080p max resolution.
    Uses H.264 + AAC + faststart for instant streaming and compact disk storage.
    If FFmpeg is not found, safely copies the file as an MP4.
    """
    ffmpeg_bin = get_ffmpeg_cmd()
    if not ffmpeg_bin:
        shutil.copy2(raw_video_path, output_mp4_path)
        return

    # Scale down to 1080p max (width max 1920, even width/height)
    scale_filter = "scale='min(1920,iw)':-2"

    cmd = [
        ffmpeg_bin,
        "-y",
        "-i", str(raw_video_path),
        "-vf", scale_filter,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        str(output_mp4_path),
    ]

    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=180)
        if res.returncode != 0:
            shutil.copy2(raw_video_path, output_mp4_path)
    except Exception:
        shutil.copy2(raw_video_path, output_mp4_path)


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
