"""pytesseract wrapper that degrades gracefully when the binary is absent."""
from __future__ import annotations

from backend.core import config

_initialized = False
_available = False


def available() -> bool:
    global _initialized, _available
    if not _initialized:
        _initialized = True
        cmd = config.find_tesseract()
        if cmd:
            import pytesseract

            pytesseract.pytesseract.tesseract_cmd = cmd
            _available = True
    return _available


def image_to_text(pil_image) -> str:
    if not available():
        return ""
    import pytesseract

    try:
        return pytesseract.image_to_string(pil_image) or ""
    except Exception:
        return ""
