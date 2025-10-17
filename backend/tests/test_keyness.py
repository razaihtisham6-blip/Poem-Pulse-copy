import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

import keyness


def test_relative_freq_non_empty_input_sums_to_one_and_a_is_highest():
    tokens = ["a", "b", "a", "c", "a"]
    result = keyness.relative_freq(tokens)

    # Frequencies should sum to 1 (allow small floating point error)
    total = sum(result.values())
    assert abs(total - 1.0) < 1e-9

    # 'a' should have the highest frequency (3/5)
    items = list(result.items())
    assert items[0][0] == 'a'
    assert abs(items[0][1] - 0.6) < 1e-9


def test_relative_freq_empty_input_returns_empty_dict():
    tokens = []
    result = keyness.relative_freq(tokens)
    assert result == {}


