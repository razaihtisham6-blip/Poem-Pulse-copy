from collections import Counter
import numpy as np
import math

def relative_freq(tokenized_text):
    counts = Counter(tokenized_text)
    total = sum(counts.values())
    freq = {key: value / total for key, value in counts.items()}

    # Fix sorting: sort by frequency (value) descending
    sorted_freq = dict(sorted(freq.items(), key=lambda item: item[1], reverse=True))

    return sorted_freq