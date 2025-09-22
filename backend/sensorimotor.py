import pandas as pd

norms = pd.read_csv("Lancaster_sensorimotor_norms_for_39707_words.csv")

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

