# QA finding: every branch here could raise an unhandled exception that
# surfaced to the client as a raw 500 stack trace — a non-UTF8 .txt file
# (UnicodeDecodeError), a corrupted/encrypted PDF (pypdf raises various
# PdfReadError subclasses), or a corrupted/non-.docx file saved with a
# .docx extension (python-docx raises PackageNotFoundError). None of
# these were caught anywhere in the call chain. Also, an unsupported
# file extension silently returned "" with no indication of WHY, which
# then surfaced to the user as the generic, misleading "No input
# provided" — even though a file genuinely was provided.
from pypdf import PdfReader
from docx import Document


class FileReadError(Exception):
    """Raised for a recognized file type that couldn't actually be read,
    so callers can show a specific, honest error instead of either a raw
    stack trace or the misleading generic "No input provided"."""


def read_file(file):
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        try:
            reader = PdfReader(file.file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception as e:
            # Broad on purpose: pypdf raises several different exception
            # types for different corruption modes (PdfReadError,
            # DependencyError for encrypted PDFs needing a password,
            # plain ValueError for a malformed stream) — none of them
            # should crash the request.
            raise FileReadError(f"Couldn't read this PDF — it may be corrupted or password-protected ({e})")
        return text

    elif filename.endswith(".txt"):
        raw = file.file.read()
        try:
            return raw.decode("utf-8")
        except UnicodeDecodeError:
            # Fall back to a permissive decode rather than failing
            # outright — better to analyze slightly-mangled text than to
            # refuse a real file over an encoding mismatch (e.g. Latin-1
            # policies exported from older tools).
            return raw.decode("utf-8", errors="replace")

    elif filename.endswith(".docx"):
        try:
            doc = Document(file.file)
            return "\n".join(para.text for para in doc.paragraphs)
        except Exception as e:
            # .docx is a zip archive under the hood — corruption can
            # surface as python-docx's own PackageNotFoundError, a raw
            # zipfile.BadZipFile, a KeyError for a missing internal part,
            # or others. None of them should crash the request.
            raise FileReadError(f"Couldn't read this .docx file — it may be corrupted or not a real Word document ({e})")

    raise FileReadError(f"Unsupported file type: \"{file.filename}\". Please upload a .pdf, .txt, or .docx file.")
