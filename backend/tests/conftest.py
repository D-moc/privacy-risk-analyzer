import os
import sys

# Ensure `backend/` (this file's parent dir) is importable as the root
# for `from services.xxx import yyy` regardless of where pytest is
# invoked from.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
