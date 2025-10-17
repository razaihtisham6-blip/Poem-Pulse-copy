import os
import sys
import pandas as pd

# Ensure backend package is importable
CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

import sensorimotor  # imports backend/sensorimotor.py


def test_sensory_norm_uppercases_inputs_and_keeps_raw_keys(monkeypatch):
    calls = []

    def fake_get_norm(word):
        calls.append(word)
        if word == 'APPLE':
            return {
                'visual_strength': 1.0,
                'auditory_imagery': 2.0,
            }
        return None

    # Patch get_norm so we control known/unknown behavior
    monkeypatch.setattr(sensorimotor, 'get_norm', fake_get_norm)

    words = ['apple', 'banana']
    result = sensorimotor.sensory_norm(words)

    # Lookup should be performed on uppercased tokens
    assert calls == ['APPLE', 'BANANA']

    # Result keys are the uppercased tokens
    assert set(result.keys()) == {'APPLE', 'BANANA'}

    # Known word returns dict with raw keys (underscores preserved)
    assert isinstance(result['APPLE'], dict)
    assert 'visual_strength' in result['APPLE']
    assert 'auditory_imagery' in result['APPLE']
    assert any('_' in k for k in result['APPLE'].keys())  # underscores not replaced in backend

    # Unknown word returns None
    assert result['BANANA'] is None


def test_get_norm_uses_dataframe_lookup(monkeypatch):
    # Provide a tiny in-memory dataframe to avoid reading the CSV
    df = pd.DataFrame([
        {'Word': 'APPLE', 'visual_strength': 1.5, 'auditory_imagery': 0.5},
    ])
    monkeypatch.setattr(sensorimotor, 'norms', df)

    row = sensorimotor.get_norm('APPLE')
    assert isinstance(row, dict)
    assert row['Word'] == 'APPLE'
    assert row['visual_strength'] == 1.5
    assert row['auditory_imagery'] == 0.5
    # Ensure raw keys are preserved (underscores keep existing form)
    assert any('_' in k for k in row.keys())


