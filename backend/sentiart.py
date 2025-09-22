from sklearn.metrics.pairwise import cosine_similarity
from gensim.models import KeyedVectors
import numpy as np

model = KeyedVectors.load("glove50.kv", mmap='r')

positive_ref = np.mean([model[w] for w in ["good", "happy", "love"] if w in model], axis=0)
negative_ref = np.mean([model[w] for w in ["bad", "sad", "hate"] if w in model], axis=0)

def sentiart_rating(word):
    if word in model:
        vec = model[word].reshape(1, -1)
        pos_sim = cosine_similarity(vec, positive_ref.reshape(1, -1))[0][0]
        neg_sim = cosine_similarity(vec, negative_ref.reshape(1, -1))[0][0]
        return pos_sim - neg_sim
    return None

def ratings(processed_text):
    dictionary = {w: sentiart_rating(w) for w in processed_text}
    for key, value in dictionary.items():
        if isinstance(value, (np.floating, np.integer)):
            dictionary[key] = value.item()
    return dictionary