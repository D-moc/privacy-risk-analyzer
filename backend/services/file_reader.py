from pypdf import PdfReader
from docx import Document

def read_file(file):
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        reader = PdfReader(file.file)
        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        return text

    elif filename.endswith(".txt"):
        return file.file.read().decode("utf-8")

    elif filename.endswith(".docx"):
        doc = Document(file.file)

        return "\n".join(
            para.text
            for para in doc.paragraphs
        )

    return ""