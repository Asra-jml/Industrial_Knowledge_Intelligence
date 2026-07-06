"""RFC-822 .eml parser. The corpus emails are single-part plain text.
People on From/To/Cc become Person nodes downstream."""
from __future__ import annotations

from email import policy
from email.parser import BytesParser
from email.utils import getaddresses, parsedate_to_datetime
from pathlib import Path

from backend.core.models import ParsedDoc


def parse(path: Path, doc_id: str, doc_type: str) -> ParsedDoc:
    with open(path, "rb") as f:
        msg = BytesParser(policy=policy.default).parse(f)

    persons = []
    for role in ("from", "to", "cc"):
        for name, addr in getaddresses([msg.get(role, "")]):
            if name or addr:
                persons.append({"name": name or addr, "email": addr, "role": role})

    date_iso = ""
    if msg.get("date"):
        try:
            date_iso = parsedate_to_datetime(msg["date"]).date().isoformat()
        except (TypeError, ValueError):
            pass

    body = msg.get_body(preferencelist=("plain",))
    body_text = body.get_content() if body else ""
    subject = msg.get("subject", "")
    header_block = (
        f"Subject: {subject}\nFrom: {msg.get('from', '')}\n"
        f"To: {msg.get('to', '')}\nDate: {msg.get('date', '')}\n\n"
    )

    return ParsedDoc(
        doc_id=doc_id,
        doc_type=doc_type,
        source_path=str(path),
        title=subject or path.stem,
        text=header_block + body_text,
        metadata={
            "subject": subject,
            "date": date_iso,
            "persons": persons,
        },
    )
