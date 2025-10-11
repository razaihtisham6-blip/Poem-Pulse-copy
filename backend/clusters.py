# clusters.py
# =========================
# Word clustering + t-SNE with consistent labels & colors
# Exposes: word_cluster(tokens: list[str]) -> str (base64 PNG)
# =========================
from __future__ import annotations
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


import io
import re
import base64
from collections import defaultdict

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import matplotlib.patheffects as pe

# NLP / ML
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score   # ADDED: for automatic K
from nltk.corpus import stopwords
from nltk import download, word_tokenize

# Embeddings
import gensim.downloader as api

# ---------------- Config ----------------
PCA_COMPONENTS = 50
RANDOM_STATE   = 42

# ADDED: cache model so repeated API calls don’t reload ~80MB every time
_MODEL = None

def _get_model():
    global _MODEL
    if _MODEL is None:
        _MODEL = api.load("glove-wiki-gigaword-100")  # 100-d GloVe
    return _MODEL

# ADDED: robust token cleaner (keeps words with letters/' only)
_WORD_RE = re.compile(r"[a-z']+$")

# ADDED: choose K automatically using silhouette on PCA space
def _choose_k_auto(X_reduced: np.ndarray, min_k: int = 10, max_k: int = 50, random_state: int = RANDOM_STATE) -> int:
    """
    Pick K in [min_k, max_k] (clipped by n_points-1) using silhouette score on X_reduced.
    Falls back gracefully for very small texts.
    """
    n = len(X_reduced)
    if n <= 3:
        return 2

    max_k = min(max_k, n - 1)
    if max_k < min_k:
        # Not enough points for min_k; pick a small safe number of clusters
        return max(2, min(5, max_k))

    # Probe up to ~10 candidates (always include edges)
    if max_k - min_k + 1 <= 10:
        candidates = list(range(min_k, max_k + 1))
    else:
        grid = np.linspace(min_k, max_k, num=10, dtype=int)
        candidates = sorted(set([min_k, max_k] + list(grid)))

    best_k, best_score = None, -1.0
    for k in candidates:
        km = KMeans(n_clusters=k, n_init="auto", random_state=random_state)
        labels = km.fit_predict(X_reduced)
        # Need at least 2 non-empty clusters
        if len(set(labels)) < 2 or len(set(labels)) >= n:
            continue
        try:
            score = silhouette_score(X_reduced, labels, metric="euclidean")
        except Exception:
            continue
        if score > best_score:
            best_k, best_score = k, score

    return best_k if best_k is not None else max(2, min_k)

# ADDED: helper to put “top cluster headings” on the plot
def _top_terms(words_c, vecs_c, n=5):
    centroid = vecs_c.mean(axis=0, keepdims=True)
    d = ((vecs_c - centroid) ** 2).sum(axis=1)
    idx = np.argsort(d)[:n]
    return [words_c[i] for i in idx]

def _add_top_cluster_headings(ax, words, labels, coords_2d, vecs_hi,
                              color_map, top_k=4, words_per_heading=5,
                              fontsize=12):
    # Largest clusters first
    uniq = np.unique(labels)
    sizes = {c: int(np.sum(labels == c)) for c in uniq}
    top_clusters = sorted(sizes, key=sizes.get, reverse=True)[:top_k]

    for c in top_clusters:
        mask = (labels == c)
        xs, ys = coords_2d[mask, 0], coords_2d[mask, 1]
        cx, cy = xs.mean(), ys.mean()
        words_c = [w for w, m in zip(words, mask) if m]
        vecs_c  = vecs_hi[mask]
        summary = ", ".join(_top_terms(words_c, vecs_c, n=words_per_heading))
        ax.text(
            cx, cy,
            f"Cluster {c}: {summary}",
            fontsize=fontsize,
            color=color_map[c],
            ha="center", va="center", fontweight="bold", alpha=0.95,
            path_effects=[pe.withStroke(linewidth=3, foreground="white")]
        )

# ---------------- Public API ----------------
def word_cluster(tokens: list[str]) -> str:
    """
    Build a t-SNE word cluster plot and return a base64 PNG string.
    Input is a list of tokens (already lowercased in your backend).
    """
    # Safety downloads (no-op if already cached)
    download("stopwords", quiet=True)
    download("punkt", quiet=True)

    stop = set(stopwords.words("english"))

    # 1) Clean tokens (keep simple word shapes, drop stopwords)
    words_all = []
    seen = set()
    for t in tokens:
        w = t.strip().lower()
        if not w or w in stop or not _WORD_RE.fullmatch(w):
            continue
        if w not in seen:
            words_all.append(w)
            seen.add(w)

    # If nothing usable, return a tiny empty plot to keep API stable
    if len(words_all) < 3:
        fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
        ax.text(0.5, 0.5, "Not enough unique words", ha="center", va="center")
        ax.axis("off")
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("ascii")

    # 2) Embeddings
    model = _get_model()
    words = [w for w in words_all if w in model]
    if len(words) < 3:
        # same graceful fallback
        fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
        ax.text(0.5, 0.5, "Too few in-vocab words", ha="center", va="center")
        ax.axis("off")
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("ascii")

    X = np.array([model[w] for w in words], dtype=float)

    # 3) PCA
    pca = PCA(n_components=min(PCA_COMPONENTS, X.shape[1]), random_state=RANDOM_STATE)
    X_reduced = pca.fit_transform(X)

    # 4) Choose K automatically in [10..50] (with graceful fallback)
    K = _choose_k_auto(X_reduced, min_k=10, max_k=50, random_state=RANDOM_STATE)

    # 5) KMeans on PCA space (authoritative labels)
    kmeans = KMeans(n_clusters=K, n_init="auto", random_state=RANDOM_STATE)
    labels = kmeans.fit_predict(X_reduced)

    # 6) t-SNE for 2D viz
    perp = max(5, min(30, len(words) // 3))  # robust perplexity for small vocab
    tsne = TSNE(n_components=2, perplexity=perp, learning_rate="auto",
                init="random", random_state=RANDOM_STATE)
    X_2d = tsne.fit_transform(X_reduced)

    # 7) Colors
    uniq = np.unique(labels)
    cmap = plt.cm.get_cmap('tab20', len(uniq)) if len(uniq) <= 20 else plt.cm.get_cmap('gist_ncar', len(uniq))
    color_map = {lab: cmap(i) for i, lab in enumerate(uniq)}
    point_colors = np.array([color_map[lab] for lab in labels])

    # 8) Plot
    fig, ax = plt.subplots(figsize=(18, 12), dpi=200)

    ax.scatter(X_2d[:, 0], X_2d[:, 1], c=point_colors, s=70, alpha=0.95, linewidths=0, zorder=1)
    for x, y, w, lab in zip(X_2d[:, 0], X_2d[:, 1], words, labels):
        ax.annotate(
            w, (x, y), xytext=(6, 1), textcoords="offset points",
            fontsize=12, color=color_map[lab], zorder=2,
            path_effects=[pe.withStroke(linewidth=3, foreground="white")]
        )

    handles = [Patch(color=color_map[lab], label=f"Cluster {lab}") for lab in uniq]
    ax.legend(handles=handles, title=f"KMeans (k={K})", bbox_to_anchor=(1.02, 1), loc="upper left")

    # ADDED: same “top cluster headings” you liked (3–4)
    _add_top_cluster_headings(
        ax=ax,
        words=words,
        labels=labels,
        coords_2d=X_2d,
        vecs_hi=X_reduced,
        color_map=color_map,
        top_k=4,
        words_per_heading=5,
        fontsize=12
    )

    ax.set_title("t-SNE Word Clusters (colored dots + colored labels)", fontsize=16)
    fig.tight_layout()

    # 9) Return as base64 PNG (no data URL prefix; your frontend can add it)
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("ascii")
    return b64
# backend.py

