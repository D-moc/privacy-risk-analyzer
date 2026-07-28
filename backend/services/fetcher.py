import asyncio
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

from playwright.async_api import async_playwright

from services.policy_gate import looks_like_privacy_policy

# Plain requests.get() sends a "python-requests/x.x" User-Agent and has
# no real DOM to query — confirmed 403-blocked by real sites (zepto.com,
# infosys.com, titan.co.in all required a genuine browser load, not a
# scripted HTTP client). A real headless Chromium browser (via
# Playwright) fixes both problems at once: it isn't blocked the same
# way, and it gives us the loaded page's actual anchor tags to search
# for a privacy/terms/cookies link — the server-side equivalent of the
# extension's findPolicyLinkInPage(). So for any URL input, this always
# goes through Chromium, not just as a fallback.
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

PAGE_LOAD_TIMEOUT_MS = 20000

# Same 3 keyword groups + same-domain-first rule as the extension's
# findPolicyLinkInPage() (see frontend/extension-src/src/lib/chrome.js
# and frontend/extension/background.js) — kept as an independent Python
# implementation of the identical rule, not a forced cross-language
# shared abstraction. A same-domain candidate always outranks a
# cross-domain one, regardless of which keyword group matched first
# (real bug this avoids: a homepage's "Privacy Notice" link pointing at
# policies.google.com — an embedded reCAPTCHA notice, not the site's
# own policy).
#
# Within a domain/group bucket, a CANONICAL label (the anchor text is
# just "Privacy Policy"/"Privacy Notice"/etc, nothing else) always
# outranks a merely-matching one, regardless of DOM order. Real bug
# this fixes: openai.com's footer has BOTH "Security & Privacy" (a
# marketing subpage, not the legal document) and "Privacy Policy" (the
# actual one) — both match the "privacy" pattern, but "Security &
# Privacy" appears first in the DOM and was winning outright before
# this fix (confirmed via direct testing against the real site).
KEYWORD_GROUPS = [
    ("privacy", re.compile(r"privacy", re.I), re.compile(r"^privacy(\s+(policy|notice|statement))?$", re.I)),
    ("terms", re.compile(r"terms|conditions", re.I), re.compile(r"^(terms(\s+of\s+(use|service))?|terms\s*(&|and)\s*conditions)$", re.I)),
    ("cookies", re.compile(r"cookie", re.I), re.compile(r"^cookies?(\s+(policy|notice))?$", re.I)),
]


def _pick_best_policy_link(anchors, base_url):
    base_host = urlparse(base_url).hostname
    same_domain = {}
    cross_domain = {}

    for anchor in anchors:
        href = anchor.get("href") or ""
        text = (anchor.get("text") or "").strip()
        if not href:
            continue

        host = urlparse(href).hostname
        bucket = same_domain if host == base_host else cross_domain

        for key, pattern, canonical_pattern in KEYWORD_GROUPS:
            if not (pattern.search(text) or pattern.search(href)):
                continue
            is_canonical = bool(canonical_pattern.match(text))
            existing = bucket.get(key)
            if not existing or (is_canonical and not existing["canonical"]):
                bucket[key] = {"href": href, "canonical": is_canonical}

    def pick(bucket, key):
        entry = bucket.get(key)
        return entry["href"] if entry else None

    return (
        pick(same_domain, "privacy") or pick(same_domain, "terms") or pick(same_domain, "cookies")
        or pick(cross_domain, "privacy") or pick(cross_domain, "terms") or pick(cross_domain, "cookies")
    )


async def _load_page_text_and_anchors(page, url):
    response = await page.goto(url, wait_until="load", timeout=PAGE_LOAD_TIMEOUT_MS)
    if response is not None and not response.ok:
        return None, []

    text = await page.evaluate("() => document.body.innerText")
    anchors = await page.eval_on_selector_all(
        "a[href]",
        "els => els.map(e => ({ text: (e.textContent || '').trim(), href: e.href }))",
    )
    return " ".join((text or "").split()), anchors


async def _fetch_via_playwright(input_data):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            try:
                page = await browser.new_page(user_agent=USER_AGENT)

                text, anchors = await _load_page_text_and_anchors(page, input_data)
                if text is None:
                    return ""

                # Already looks like a real privacy policy — no need for
                # an extra hop. Whatever URL/domain was given (homepage
                # or the exact policy page), the user should never have
                # to know or paste the difference.
                if looks_like_privacy_policy(text):
                    return text

                link = _pick_best_policy_link(anchors, input_data)
                if not link:
                    return text

                # A fresh page for this second hop, not the same one
                # reused — real bug found testing this on openai.com: a
                # same-origin second navigation on the SAME page object
                # returned the homepage's OWN text again (a client-side
                # SPA/service-worker route change didn't finish
                # re-rendering before "load" resolved and innerText was
                # read). Navigating a brand-new page to the link's URL
                # doesn't have that stale-render risk and reliably
                # returned the real, distinct linked-page content.
                linked_page = await browser.new_page(user_agent=USER_AGENT)
                linked_text, _ = await _load_page_text_and_anchors(linked_page, link)
                return linked_text or text
            finally:
                await browser.close()

    except Exception as e:
        print("Fetch error:", e)
        return ""


def _run_playwright_fetch_in_fresh_loop(input_data):
    # Playwright's async API launches a real browser subprocess, which on
    # Windows only works under the Proactor event loop. uvicorn (with
    # --reload especially) keeps resetting the GLOBAL event loop policy to
    # Selector on Windows — confirmed live: even setting the policy via
    # asyncio.set_event_loop_policy() inside this dedicated thread, right
    # before asyncio.run(), still failed under --reload, because that call
    # only changes the shared global policy object, which something else
    # was racing to reset back to Selector. Building the Proactor loop
    # directly from its own policy INSTANCE (not the shared global one)
    # and setting it as this thread's current loop sidesteps that race
    # entirely — confirmed to work standalone and live, with and without
    # --reload.
    if sys.platform == "win32":
        loop = asyncio.WindowsProactorEventLoopPolicy().new_event_loop()
    else:
        loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_fetch_via_playwright(input_data))
    finally:
        loop.close()


async def fetch_policy(input_data):
    if not input_data:
        return ""

    if not (isinstance(input_data, str) and input_data.startswith("http")):
        return input_data

    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor(max_workers=1) as pool:
        return await loop.run_in_executor(pool, _run_playwright_fetch_in_fresh_loop, input_data)
