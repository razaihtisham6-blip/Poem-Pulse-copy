import os
import sys

# Ensure we can import the backend module (backend/backend.py)
CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

import backend as backend_module  # imports backend/backend.py as a module


def test_tokenize_strips_apostrophes_lowercases_and_removes_stopwords():
    input_text = "Don't, THE a sun"
    expected = ["dont", "sun"]

    result = backend_module.tokenize(input_text)

    assert result == expected


