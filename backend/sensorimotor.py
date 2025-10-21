import pandas as pd
from pathlib import Path
from matplotlib import pyplot as plt

import re
import io
import base64

_BASE_DIR = Path(__file__).resolve().parent
_NORMS_PATH = _BASE_DIR / "Lancaster_sensorimotor_norms_for_39707_words.csv"
norms = pd.read_csv(_NORMS_PATH)

sensory_norm_data = {}
target_keys = ["Dominant.perceptual", "Dominant.action", "Dominant.sensorimotor"]

#Dominant category counts
perceptual_count = dict.fromkeys(norms["Dominant.perceptual"].unique(), 0)
action_count = dict.fromkeys(norms["Dominant.action"].unique(), 0)
sensorimotor_count = dict.fromkeys(norms["Dominant.sensorimotor"].unique(), 0)

#Get norm data for a word
def get_norm(word):
    row = norms[norms['Word'] == word]
    if not row.empty:
        return row.iloc[0].to_dict()
    return None

def sensory_norm(processed_text):
    #Convert to uppercase for compatibility with norms dataset
    for i in range(len(processed_text)):
        processed_text[i] = processed_text[i].upper()

    #Collect norms data
    for w in processed_text:
        if not get_norm(w) == None: #Ignore words not in norms dataset
            word_data = {k: v for k, v in get_norm(w).items() if k in target_keys}

            perceptual_count[word_data['Dominant.perceptual']] += 1
            action_count[word_data['Dominant.action']] += 1
            sensorimotor_count[word_data['Dominant.sensorimotor']] += 1

            #Add to data dict
            sensory_norm_data[w] = word_data

    # ===== Graph =====
    p_keys = list(perceptual_count.keys())
    p_vals = list(perceptual_count.values())
    a_keys = list(action_count.keys())
    a_vals = list(action_count.values())
    s_keys = list(sensorimotor_count.keys())
    s_vals = list(sensorimotor_count.values())

    dataset = [
    (p_keys, p_vals),
    (a_keys, a_vals),
    (s_keys, s_vals)
    ]

    titles = ["Dominant Perceptual", "Dominant Action", "Dominant Sensorimotor"]

    fig, axes = plt.subplots(2, 2, figsize=(8, 8))

    #Flatten axes to loop
    axes = axes.flatten()

    #Create pie charts
    for i, (labels, sizes) in enumerate(dataset):
        filtered_labels = [l for l, s in zip(labels, sizes) if s > 0]
        filtered_sizes = [s for s in sizes if s > 0]
    
        axes[i].pie(filtered_sizes, labels=filtered_labels, autopct='%1.1f%%')
        axes[i].set_title(titles[i])

    axes[3].axis('off')

    plt.tight_layout()

    #Convert to base64 image
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()

    return sensory_norm_data #{"data": sensory_norm_data, "image_base64": image_base64}


