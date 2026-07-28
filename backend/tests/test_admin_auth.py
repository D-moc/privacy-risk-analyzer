import importlib

import utils.admin_auth as admin_auth


def _fresh_module():
    """Reload so each test starts with a clean _failed_attempts dict —
    it's process-global, shared across tests otherwise."""
    importlib.reload(admin_auth)
    return admin_auth


def test_not_rate_limited_initially():
    mod = _fresh_module()
    assert mod.is_rate_limited("client-a") is False


def test_rate_limited_after_max_attempts():
    # QA regression test: /api/admin/login had no rate limiting or
    # lockout at all — brute-forceable at whatever rate the network
    # allowed.
    mod = _fresh_module()
    client = "client-b"
    for _ in range(mod.MAX_ATTEMPTS):
        assert mod.is_rate_limited(client) is False
        mod.record_failed_attempt(client)
    assert mod.is_rate_limited(client) is True


def test_different_clients_tracked_independently():
    mod = _fresh_module()
    for _ in range(mod.MAX_ATTEMPTS):
        mod.record_failed_attempt("client-c")
    assert mod.is_rate_limited("client-c") is True
    assert mod.is_rate_limited("client-d") is False
