# PrivacyLens Backend — QA Findings Report

Senior QA pass over the core analysis pipeline (input intake → text
extraction → classification → scoring → output). No automated test
suite existed prior to this pass (no `tests/`, no pytest/vitest config,
no README). `pytest` was added to `backend/venv` and a `backend/tests/`
suite was written alongside the fixes below.

## Summary

| # | Bug | Severity | Location | Status |
|---|-----|----------|----------|--------|
| 1 | Negation-blind dark pattern detection — "We do NOT share with third parties" flagged as a critical "Vague Data Sharing" finding | **Critical** | `services/dark_pattern.py` | Fixed |
| 2 | `cross_check_findings()` only ever escalated severity, never corrected it downward — a plainly protective statement mislabeled "severe" by Groq stayed "severe" forever even when Model B was 93% confident it was "good" | **Critical** | `services/ml_cross_check.py` | Fixed |
| 3 | Unhandled exceptions on file upload — non-UTF8 `.txt`, corrupted/encrypted PDF, corrupted `.docx` all crashed with a raw 500/stack trace | **Critical** | `services/file_reader.py` | Fixed |
| 4 | `shares_with_third_parties` computed once globally and applied to every data type regardless of proximity — a sharing mention anywhere in the document marked ALL collected data types as "shared" | **Major** | `services/keyword_scorer.py` | Fixed |
| 5 | `disclosure_checks.py` had its own weaker, independently-duplicated phrase matcher with no negation handling (inconsistent with the fix already applied elsewhere in the codebase) | **Major** | `services/disclosure_checks.py` | Fixed |
| 6 | `/api/admin/login` had no rate limiting — brute-forceable at network speed, and the configured credentials are the weak default `admin`/`admin` | **Major** | `utils/admin_auth.py`, `routes/admin_auth.py` | Rate limit fixed; weak credentials flagged (config, not code) |
| 7 | "retain indefinitely" keyword didn't match the common past-tense phrasing "retained indefinitely" | Minor | `services/dark_pattern.py` | Fixed |
| 8 | Unsupported file upload types returned `""` silently, surfacing as the misleading generic "No input provided" instead of a clear reason | Minor | `services/file_reader.py` | Fixed (same change as #3) |
| 9 | `get_report()` / `delete_report()` in `history_service.py` are defined but never called from any route — dead code | Minor | `services/history_service.py` | Documented only, not removed |
| 10 | `ml_cross_check.py`'s lazy model-loading (`_loaded` flag) isn't safe against two truly concurrent first-requests both loading the model redundantly | Informational | `services/ml_cross_check.py` | Not fixed — wasted work, not incorrect behavior |

Also **explicitly checked and confirmed safe** (not bugs, but worth
recording since they were real candidates): `dangerouslySetInnerHTML`
usage in `DetailsPanel.jsx` / `FloatingAskAI.jsx` (the custom
`renderMarkdown()` escapes `<`/`>`/`&` on the *entire* raw string before
any tag generation, so even literal `<script>` text in an AI-generated
report renders as inert text, not executable markup); no hardcoded
secrets in application code; `.env` properly gitignored; MongoDB
queries use plain dict values from verified Firebase tokens, not
user-constructed filter objects (no NoSQL injection surface found);
`clause_classifier.py`'s Groq call is already wrapped in a broad
try/except with graceful degradation (network failure, timeout, or bad
API key all fall back to an empty findings list rather than crashing);
concurrent requests with different content were confirmed to produce
correct, non-cross-contaminated results.

## 1. Dark pattern detection was negation-blind (Critical)

**Repro**: `detect_dark_patterns("We do not share with third parties or affiliates under any circumstances.")` returned `["Vague Data Sharing"]` — a policy explicitly *denying* the practice was flagged as having it, as a "critical"-severity finding that directly inflates the risk score.

**Root cause**: every check in `dark_pattern.py` was a plain `k in t` substring search with no negation awareness at all — the exact bug class already found and fixed twice elsewhere in this codebase (`keyword_scorer.py`, the trained models), just never applied here.

**Fix**: extracted the negation-aware matcher into `services/text_matching.py` (shared with `keyword_scorer.py` and `disclosure_checks.py` — see finding 5 — so it can't drift out of sync between files again) and rewrote `dark_pattern.py` to use it. Verified the categories whose *own* keywords contain negation words as part of their intended meaning ("cannot opt out", "cannot use ... without agreeing") still fire correctly — the negation check only looks at text *before* a matched phrase, never within it.

**Test**: `tests/test_dark_pattern.py`

## 2. Model disagreement could only escalate risk, never correct it (Critical)

**Repro**:
```python
cross_check_findings([{
    "label": "We never sell or share your personal information with third parties",
    "detail": "", "severity": "severe",
}])
# -> severity stays "severe", verified: False
```
Model B (trained on ToS;DR severity labels) scores this text 92.7% "good". The code correctly detects the disagreement (`verified: False`) but `if model_rank > original_rank: finding["severity"] = model_severity` only ever escalates — there was no path to correct a clearly wrong severity downward.

**Root cause**: this was a documented, *intentional* design choice ("on disagreement, the stricter severity wins") for genuine magnitude disagreements (moderate vs. severe) — but the same one-directional rule was also silently swallowing a much worse case: Groq flatly mislabeling the *polarity* of a finding (calling a protection a threat).

**Fix**: added a confidence-gated downward correction — only when the original severity is "severe"/"critical" **and** Model B's `predict_proba` shows "good" beating "severe"+"critical" combined by a real margin (0.15, mirroring the `GRANTED_MARGIN` pattern already used elsewhere in this file). Ordinary magnitude disagreements still only escalate, preserving the original "err toward flagging real concerns" intent.

**Test**: `tests/test_ml_cross_check.py` (skips gracefully if the model artifact isn't present in a given environment)

## 3. Unhandled file-upload exceptions crashed with raw stack traces (Critical)

**Repro**: uploading a `.txt` file with Latin-1 encoding raised `UnicodeDecodeError`; a corrupted `.pdf` raised various `pypdf` exceptions; a corrupted `.docx` raised `zipfile.BadZipFile` (a `.docx` is a zip archive under the hood — this surfaced as a *different* exception type than `python-docx`'s own `PackageNotFoundError`, so an initial narrower fix attempt still crashed on this case until broadened). None of these were caught anywhere in the call chain, so FastAPI returned a raw 500 with a full stack trace to the client.

**Fix**: `file_reader.py` now catches all three failure modes and raises a new `FileReadError` with a clear, specific message; `routes/analyze.py` catches `FileReadError` and returns `{"error": "..."}` instead of letting it propagate. Non-UTF8 `.txt` files fall back to a permissive decode (`errors="replace"`) rather than failing outright. Unsupported file extensions now raise a clear "Unsupported file type" error instead of silently returning `""` (which used to surface as the misleading "No input provided" — finding #8, same fix).

**Test**: `tests/test_file_reader.py`

## 4. Data-sharing detection wasn't scoped to the data type it claimed to describe (Major)

**Repro**: a policy mentioning "email address" in one paragraph and, entirely separately, generic sharing boilerplate ("...share aggregate analytics with our advertising partners...") anywhere else in the document, marked Contact Info as `"shared"` — even though contact info specifically was never described as being shared with anyone.

**Root cause**: `shares_with_third_parties` was one global boolean for the whole document, applied identically to every data type.

**Fix**: replaced with a proximity-windowed check (`_shared_near_mention`, 300-char window, mirroring the same technique already used for negation) — a sharing signal only counts for a given data type if it's reasonably close to an actual mention of that type, not just anywhere in the document.

**Test**: `tests/test_keyword_scorer.py`

## 5. `disclosure_checks.py` duplicated a weaker matcher with no negation handling (Major)

Its own `_matches_any_group` was a second, independent, plain-substring implementation — inconsistent with the negation-aware version already built and proven in `keyword_scorer.py`. Fixed by importing the shared `matches_any_group` from the new `text_matching.py` instead. Test: `tests/test_disclosure_checks.py`.

## 6. Admin login had no rate limiting; weak default credentials (Major)

`/api/admin/login` did a plain string comparison with no attempt tracking — brute-forceable at network speed. **Fixed**: added an in-memory rate limiter (5 failed attempts / 5 minutes per client IP) in `utils/admin_auth.py`, enforced in `routes/admin_auth.py`.

**Not fixed (config, not code)**: `backend/.env` currently has `ADMIN_USERNAME=admin` / `ADMIN_PASSWORD=admin`. This is a real weak-credential risk if this backend is ever exposed beyond `127.0.0.1` — recommend changing both values directly in `.env` (not something to change without your input, since it's your own environment secret).

## Risks found but not fixed — needs discussion

- **Admin session token never expires / no logout invalidation.** `ADMIN_SESSION_SECRET` is a fixed shared secret returned as the "token" — there's no server-side session state, so a leaked token stays valid until the secret itself is rotated in `.env`. Documented in project memory as an intentional simplification for a single-operator local tool; changing this is an architectural decision (would need real sessions/JWT expiry), not something to redesign unilaterally as part of a QA pass.
- **Keyword-based checks across the codebase are exact-phrase-dependent**, causing false negatives on word-form variations (fixed one instance — "retain" vs "retained" — but this is a general pattern across `dark_pattern.py`, `keyword_scorer.py`, and `disclosure_checks.py`'s keyword lists). A comprehensive fix would mean stemming/lemmatization or broader regex patterns for every phrase list — a much larger undertaking than this pass, flagged for a future iteration.
- **Dead code**: `get_report()` / `delete_report()` in `history_service.py` are never called from any route. Left in place rather than removed, in case they're for a planned "view/delete a single report" feature that hasn't been wired up yet — worth confirming intent before deleting.
- **`ml_cross_check.py`'s lazy model loading isn't concurrency-safe** against two truly simultaneous first requests (both could redundantly load the model before the `_loaded` flag is set) — wastes work but doesn't corrupt anything, since the loaded model is read-only. Not fixed, given the low real-world impact.
- **Scanned/image-only PDF uploads** produce no extractable text and surface as the generic "No input provided" — a real product limitation (would need OCR), not a code bug, and out of scope for this pass.

## Test suite

`backend/tests/` (pytest, not previously present in this repo):
`test_risk_engine.py`, `test_dark_pattern.py`, `test_keyword_scorer.py`,
`test_disclosure_checks.py`, `test_ml_cross_check.py`,
`test_file_reader.py`, `test_admin_auth.py` — 33 tests, all passing.
Run with:
```
cd backend
venv/Scripts/python.exe -m pytest tests/ -v
```
