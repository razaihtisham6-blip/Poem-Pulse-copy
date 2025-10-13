import pandas as pd
from pathlib import Path

_BASE_DIR = Path(__file__).resolve().parent
_NORMS_PATH = _BASE_DIR / "Lancaster_sensorimotor_norms_for_39707_words.csv"
norms = pd.read_csv(_NORMS_PATH)

def get_norm(word):
    row = norms[norms['Word'] == word]
    if not row.empty:
        return row.iloc[0].to_dict()
    return None

def sensory_norm(processed_text):
    #data = {w: norm(w) for w in processed_text}

    for i in range(len(processed_text)):
        processed_text[i] = processed_text[i].upper()

    return {w: get_norm(w) for w in processed_text}

