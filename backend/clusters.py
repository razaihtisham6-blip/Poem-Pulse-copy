from gensim.models import KeyedVectors
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt
import numpy as np
import base64
import io

model = KeyedVectors.load("glove50.kv", mmap='r')

def word_cluster(tokenized_text):
    valid_words = [w for w in tokenized_text if w in model]
    vectors = np.array([model[w] for w in valid_words])

    pca = PCA(n_components = 2)
    coords = pca.fit_transform(vectors)

    db = DBSCAN(eps = 0.5, min_samples = 2).fit(vectors)
    labels = db.labels_

    plt.figure(figsize=(8,8))
    unique_labels = set(labels)
    colours = plt.cm.get_cmap("tab10", len(unique_labels))

    for label in unique_labels:
        mask = labels == label
        plt.scatter(coords[mask, 0], coords[mask, 1], 
                    c=[colours(label)] if label != -1 else "grey",
                    label=f"Cluster {label}" if label != -1 else "default_label")
        for (x, y, word) in zip(coords[mask, 0], coords[mask, 1], np.array(valid_words)[mask]):
            plt.text(x+0.01, y+0.01, word, fontsize=9)
    #img = base64.b64encode(buf.getvalue()).decode("utf-8")

    #image
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()

    #return buf

    return base64.b64encode(buf.getvalue()).decode("utf-8")
