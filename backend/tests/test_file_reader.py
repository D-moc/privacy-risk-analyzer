import io

import pytest

from services.file_reader import read_file, FileReadError


class FakeUpload:
    def __init__(self, filename, content_bytes):
        self.filename = filename
        self.file = io.BytesIO(content_bytes)


def test_non_utf8_txt_does_not_crash():
    # QA regression test: a Latin-1 encoded .txt file used to raise an
    # unhandled UnicodeDecodeError, surfacing as a raw 500 to the client.
    latin1_bytes = "Politique de confidentialite - donnees personnelles".encode("latin-1") + bytes([0xE9, 0xE8])
    result = read_file(FakeUpload("policy.txt", latin1_bytes))
    assert isinstance(result, str)
    assert len(result) > 0


def test_valid_utf8_txt_still_works():
    result = read_file(FakeUpload("policy.txt", "Normal privacy policy text".encode("utf-8")))
    assert result == "Normal privacy policy text"


def test_corrupted_pdf_raises_clean_error_not_crash():
    with pytest.raises(FileReadError):
        read_file(FakeUpload("fake.pdf", b"this is not a real pdf file at all"))


def test_corrupted_docx_raises_clean_error_not_crash():
    # QA regression test: this used to raise a raw zipfile.BadZipFile
    # (docx is a zip archive under the hood), not caught anywhere.
    with pytest.raises(FileReadError):
        read_file(FakeUpload("fake.docx", b"this is not a real docx file"))


def test_unsupported_file_type_raises_clear_error():
    with pytest.raises(FileReadError, match="Unsupported file type"):
        read_file(FakeUpload("policy.rtf", b"some rtf content"))


def test_none_filename_does_not_crash():
    with pytest.raises(FileReadError):
        read_file(FakeUpload(None, b"some content"))
