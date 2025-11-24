# clusters.py
# =========================
# Word clustering + t-SNE with consistent labels & colors
# Exposes: word_cluster(tokens: list[str]) -> str (base64 PNG)
# =========================
from __future__ import annotations
import matplotlib
matplotlib.use("Agg")

import io
import re
import math
import base64
import textwrap
from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import matplotlib.patheffects as pe

# NLP / ML
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score

# Embeddings
from gensim.models import KeyedVectors

# ---------------- Config ----------------
PCA_COMPONENTS = 50
RANDOM_STATE   = 42

# cache model so repeated calls don’t reload from disk
_MODEL = None
_BASE_DIR = Path(__file__).resolve().parent
_MODEL_PATH = _BASE_DIR / "glove50.kv"

def _get_model():
    global _MODEL
    if _MODEL is None:
        _MODEL = KeyedVectors.load(str(_MODEL_PATH), mmap="r")
    return _MODEL

# keep simple word shapes (letters and apostrophes)
_WORD_RE = re.compile(r"[a-z']+$")

# ---------------- Auto stopwords ----------------
_EXTRA_STOPWORDS: set[str] = set()  # add any custom/domain words if you like

def _load_stopwords(lang: str = "english") -> set[str]:
    """Prefer NLTK; fallback to spaCy or scikit-learn; then a tiny built-in set."""
    # NLTK
    try:
        from nltk.corpus import stopwords as _nltk_sw  # type: ignore
        try:
            sw = set(_nltk_sw.words(lang))
        except LookupError:
            import nltk  # type: ignore
            nltk.download("stopwords", quiet=True)
            sw = set(_nltk_sw.words(lang))
        return sw
    except Exception:
        pass

    # spaCy
    try:
        import spacy  # type: ignore
        nlp = spacy.blank("en")
        return set(nlp.Defaults.stop_words)
    except Exception:
        pass

    # scikit-learn
    try:
        from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS  # type: ignore
        return set(ENGLISH_STOP_WORDS)
    except Exception:
        pass

    # tiny last-resort fallback
    return {
        "a","an","and","the","is","are","was","were","be","been","being","to","of",
        "in","that","it","for","on","with","as","by","at","from","or","this","but",
        "not","have","has","had","do","does","did","so","if","then","than","too",
        "very","can","will","just","also","into","its","their","there","here","we",
        "you","he","she","they","i","me","my","our","your","his","her","them"
    }

_STOPWORDS: set[str] | None = None
def _get_stopwords() -> set[str]:
    """Cache + merge extras."""
    global _STOPWORDS
    if _STOPWORDS is None:
        _STOPWORDS = _load_stopwords().union(_EXTRA_STOPWORDS)
    return _STOPWORDS

# ---------------- Clustering helpers ----------------
def _choose_k_auto(X_reduced: np.ndarray, min_k: int = 10, max_k: int = 50,
                   random_state: int = RANDOM_STATE) -> int:
    """
    Pick K in [min_k, max_k] (clipped by n_points-1) using silhouette score on X_reduced.
    Falls back for very small texts.
    """
    n = len(X_reduced)
    if n <= 3:
        return 2

    max_k = min(max_k, n - 1)
    if max_k < min_k:
        return max(2, min(5, max_k))

    if max_k - min_k + 1 <= 10:
        candidates = list(range(min_k, max_k + 1))
    else:
        grid = np.linspace(min_k, max_k, num=10, dtype=int)
        candidates = sorted(set([min_k, max_k] + list(grid)))

    best_k, best_score = None, -1.0
    for k in candidates:
        km = KMeans(n_clusters=k, n_init=10, random_state=random_state)
        labels = km.fit_predict(X_reduced)
        # need at least 2 non-empty clusters
        if len(set(labels)) < 2 or len(set(labels)) >= n:
            continue
        try:
            score = silhouette_score(X_reduced, labels, metric="euclidean")
        except Exception:
            continue
        if score > best_score:
            best_k, best_score = k, score

    return best_k if best_k is not None else max(2, min_k)

def _top_terms(words_c, vecs_c, n=5):
    """Representative words per cluster: closest to centroid in vector space."""
    centroid = vecs_c.mean(axis=0, keepdims=True)
    d = ((vecs_c - centroid) ** 2).sum(axis=1)
    idx = np.argsort(d)[:n]
    return [words_c[i] for i in idx]

def _build_cluster_summaries(words, labels, vecs_hi, top_n=5):
    """Return list like: ['Cluster 0: w1, w2, ...', ...] (no headings inside plot)."""
    lines = []
    for c in sorted(np.unique(labels)):
        mask = (labels == c)
        words_c = [w for w, m in zip(words, mask) if m]
        vecs_c  = vecs_hi[mask]
        if len(words_c) == 0:
            lines.append(f"Cluster {c}: (no words)")
            continue
        reps = _top_terms(words_c, vecs_c, n=top_n)
        lines.append(f"Cluster {c}: " + ", ".join(reps))
    return lines

# ---------- Wrapping helpers for neat columns ----------
def _wrap_columns(lines, n_cols):
    """
    Wrap the summary lines across n_cols columns.
    Returns (col_texts, max_wrapped_rows) so we can size the figure.
    """
    # target width per column
    width = 48 if n_cols == 2 else (40 if n_cols == 3 else 32)

    rows = math.ceil(len(lines) / n_cols)
    col_texts = []
    max_rows = 0

    for i in range(n_cols):
        chunk = lines[i * rows : (i + 1) * rows]
        wrapped = []
        for line in chunk:
            if ": " in line:
                head, tail = line.split(": ", 1)
                wrapped_tail = textwrap.wrap(
                    tail, width=max(10, width - len(head) - 2),
                    subsequent_indent=" " * (len(head) + 2)
                )
                if wrapped_tail:
                    wrapped.append(f"{head}: {wrapped_tail[0]}")
                    wrapped.extend(wrapped_tail[1:])
                else:
                    wrapped.append(line)
            else:
                wrapped.extend(textwrap.wrap(line, width=width))
        col_texts.append("\n".join(wrapped) if wrapped else "")
        max_rows = max(max_rows, len(wrapped))
    return col_texts, max_rows

# ---------------- Public API ----------------
def word_cluster(tokens: list[str], return_data: bool = False):
    """
    Build a t-SNE word cluster plot and return a base64 PNG string or cluster data.
    Input: list of tokens (lowercased in your backend).
    If return_data is True, return cluster node data for frontend JSON.
    """
    # 1) Stopwords (auto)
    stop = _get_stopwords()

    # 2) Clean tokens
    words_all = []
    seen = set()
    for t in tokens:
        w = t.strip().lower()
        if not w or w in stop or not _WORD_RE.fullmatch(w):
            continue
        if w not in seen:
            words_all.append(w)
            seen.add(w)

    if len(words_all) < 3:
        if return_data:
            return []
        fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
        ax.text(0.5, 0.5, "Not enough unique words", ha="center", va="center")
        ax.axis("off")
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", pad_inches=0.6)
        plt.close(fig)
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode("ascii")
        return {"simple": b64, "labeled": b64}

    # 3) Embeddings
    model = _get_model()
    words = [w for w in words_all if w in model]
    if len(words) < 3:
        if return_data:
            return []
        fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
        ax.text(0.5, 0.5, "Too few in-vocab words", ha="center", va="center")
        ax.axis("off")
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", pad_inches=0.6)
        plt.close(fig)
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode("ascii")
        return {"simple": b64, "labeled": b64}

    X = np.array([model[w] for w in words], dtype=float)

    # 4) PCA
    pca = PCA(n_components=min(PCA_COMPONENTS, X.shape[0], X.shape[1]), random_state=RANDOM_STATE)
    X_reduced = pca.fit_transform(X)

    # 5) Choose K automatically
    K = _choose_k_auto(X_reduced, min_k=10, max_k=50, random_state=RANDOM_STATE)

    # 6) KMeans on PCA space
    kmeans = KMeans(n_clusters=K, n_init=10, random_state=RANDOM_STATE)
    labels = kmeans.fit_predict(X_reduced)

    # 7) t-SNE to 2D
    n_samples = len(words)
    candidate = max(2, n_samples // 3)
    perp = max(2, min(30, n_samples - 1, candidate))
    tsne = TSNE(n_components=2, perplexity=perp, learning_rate="auto",
                init="random", random_state=RANDOM_STATE)
    X_2d = tsne.fit_transform(X_reduced)

    # 8) Colors
    uniq = np.unique(labels)
    cmap = plt.cm.get_cmap('tab20', len(uniq)) if len(uniq) <= 20 else plt.cm.get_cmap('gist_ncar', len(uniq))
    color_map = {lab: cmap(i) for i, lab in enumerate(uniq)}
    point_colors = np.array([color_map[lab] for lab in labels])

    # 9A) Create a simple plot (points only) for compact views
    fig_simple, ax_simple = plt.subplots(figsize=(12, 6), dpi=150)
    ax_simple.scatter(X_2d[:, 0], X_2d[:, 1], c=point_colors, s=70, alpha=0.95, linewidths=0, zorder=1)
    handles_simple = [Patch(color=color_map[lab], label=f"Cluster {lab}") for lab in uniq]
    ax_simple.legend(handles=handles_simple, title=f"KMeans (k={len(uniq)})",
                     bbox_to_anchor=(1.02, 1), loc="upper left")
    ax_simple.set_title("t-SNE Word Clusters", fontsize=16)
    buf_simple = io.BytesIO()
    fig_simple.tight_layout()
    fig_simple.savefig(buf_simple, format="png", dpi=150, bbox_inches="tight", pad_inches=0.6)
    plt.close(fig_simple)
    buf_simple.seek(0)
    b64_simple = base64.b64encode(buf_simple.read()).decode("ascii")

    # 9B) Build summaries (names)
    summary_lines = _build_cluster_summaries(words, labels, X_reduced, top_n=5)
    if return_data:
        # Build cluster label → summary string map
        cluster_summaries = []
        for i, lab in enumerate(uniq):
            cluster_summaries.append({
                'cluster_label': int(lab),
                'summary': summary_lines[i]
            })
        out = []
        for idx, (x, y, label) in enumerate(zip(X_2d[:, 0], X_2d[:, 1], labels)):
            out.append({
                'x': float(x),
                'y': float(y),
                'word': words[idx],
                'cluster_label': int(label)
            })
        return {'points': out, 'summaries': cluster_summaries}

    # ----- Layout for neat, non-overlapping summaries -----
    K_now = len(uniq)
    if K_now <= 12:
        n_cols = 2
    elif K_now <= 24:
        n_cols = 3
    else:
        n_cols = 4

    wrapped_cols, max_rows = _wrap_columns(summary_lines, n_cols)

    # Figure sizing scales with #columns and #wrapped lines
    base_w, base_h = 14, 7   # wider base width to keep text inside
    extra_w = 3 * max(0, n_cols - 2)
    extra_h = 0.33 * max_rows  # ~0.33" per wrapped row
    fig_w = base_w + extra_w
    fig_h = base_h + extra_h

    fig = plt.figure(figsize=(fig_w, fig_h), dpi=150)

    txt_ratio = min(3.5, 1.0 + 0.28 * max_rows)  # more lines -> bigger text area
    gs = fig.add_gridspec(2, 1, height_ratios=[3, txt_ratio], hspace=0.34)
    ax = fig.add_subplot(gs[0])
    ax_txt = fig.add_subplot(gs[1])
    ax_txt.axis("off")

    # 10) Scatter + word labels (NO in-plot "Cluster X" headings)
    ax.scatter(X_2d[:, 0], X_2d[:, 1], c=point_colors, s=70, alpha=0.95, linewidths=0, zorder=1)
    for x, y, w, lab in zip(X_2d[:, 0], X_2d[:, 1], words, labels):
        ax.annotate(
            w, (x, y), xytext=(6, 1), textcoords="offset points",
            fontsize=12, color=color_map[lab], zorder=2,
            path_effects=[pe.withStroke(linewidth=3, foreground="white")]
        )

    handles = [Patch(color=color_map[lab], label=f"Cluster {lab}") for lab in uniq]
    ax.legend(handles=handles, title=f"KMeans (k={K_now})", bbox_to_anchor=(1.02, 1), loc="upper left")
    ax.set_title("t-SNE Word Clusters (colored dots + colored labels)", fontsize=16)

    # 11) Render wrapped columns with padding & white background
    fs = 10.5 if max_rows <= 14 else (9.7 if max_rows <= 22 else 9.0)
    ls = 1.30 if fs >= 10 else 1.22

    for i, col_text in enumerate(wrapped_cols):
        if not col_text:
            continue
        x = (i / n_cols) + 0.03  # padding in each slot
        ax_txt.text(
            x, 0.98, col_text, va="top", ha="left",
            fontsize=fs, family="monospace", linespacing=ls,
            transform=ax_txt.transAxes,
            bbox=dict(facecolor="white", alpha=0.92, pad=3, edgecolor="none")
        )

    ax_txt.set_title("Cluster summaries (top 5 representative words)", fontsize=12, pad=4)

    fig.tight_layout()

    # 12) Return both base64 PNGs
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", pad_inches=0.6)
    plt.close(fig)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("ascii")
    return {"simple": b64_simple, "labeled": b64}














