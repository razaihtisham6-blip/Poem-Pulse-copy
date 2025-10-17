import os
import sys
from fastapi.testclient import TestClient

# Ensure backend module is importable
CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

import backend as backend_module


def test_analyse_text_empty_returns_400_with_error_message():
    client = TestClient(backend_module.app)
    resp = client.post("/analyse-text", json={"text": ""})
    assert resp.status_code == 400
    assert resp.json() == {"error": "No text provided."}


