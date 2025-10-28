from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import io, base64, re
from collections import Counter
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from scipy.stats import fisher_exact

router = APIRouter(prefix="")

# ✅ Initialize stopwords and lemmatizer
STOPWORDS = set(stopwords.words('english'))
LEMMATIZER = WordNetLemmatizer()


def clean_words(text: str):
    """Tokenize, lowercase, remove punctuation and stopwords, and lemmatize."""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = word_tokenize(text)
    return [
        LEMMATIZER.lemmatize(w)
        for w in tokens
        if w not in STOPWORDS and len(w) > 1
    ]


@router.post("/keyness")
async def keyness(poemA: UploadFile = File(...), poemB: UploadFile = File(...)):
    try:
        # ✅ Read uploaded poem files
        textA = (await poemA.read()).decode("utf-8", errors="ignore")
        textB = (await poemB.read()).decode("utf-8", errors="ignore")

        # ✅ Clean and tokenize
        wordsA = clean_words(textA)
        wordsB = clean_words(textB)

        # ✅ Word frequencies
        freqA, freqB = Counter(wordsA), Counter(wordsB)
        totalA, totalB = sum(freqA.values()), sum(freqB.values())
        all_words = set(freqA.keys()) | set(freqB.keys())

        # ✅ Compute Fisher’s Exact Test and log ratio
        data = []
        for w in all_words:
            a, b = freqA[w], freqB[w]
            table = [[a, totalA - a], [b, totalB - b]]
            _, p = fisher_exact(table, alternative='two-sided')
            effect = np.log2((a + 1) / (b + 1))  # log ratio
            data.append((w, a, b, effect, p))

        df = pd.DataFrame(data, columns=["word", "countA", "countB", "effect", "p"])

        # ✅ Sort by absolute effect size and take top 30
        df_plot = df.reindex(df["effect"].abs().sort_values(ascending=False).index)
        df_plot = df_plot.head(30)

        # ✅ Create clean symmetric diverging plot
        plt.figure(figsize=(9, 10))
        y = np.arange(len(df_plot))

        # Symmetrical layout for both sides
        max_effect = np.ceil(np.max(np.abs(df_plot["effect"])))
        plt.xlim(-max_effect, max_effect)

        # Colors: Poem A (right) = purple, Poem B (left) = green
        colors = ["#a78bfa" if v > 0 else "#34d399" for v in df_plot["effect"]]

        plt.barh(y, df_plot["effect"], color=colors)
        plt.axvline(0, color="black", linewidth=1)
        plt.yticks(y, df_plot["word"], fontsize=9)
        plt.title("   Keyness Comparison: Poem A vs Poem B", fontsize=13)
        plt.xlabel("Effect Size (log₂ ratio)")

        # ✅ Legend box
        legend_text = (
            "Right → Over-represented in Poem A (purple)\n"
            "Left  → Over-represented in Poem B (green)"
        )
        plt.gcf().text(
            0.02, 0.98, legend_text,
            fontsize=9, ha="left", va="top",
            bbox=dict(facecolor="white", alpha=0.9, edgecolor="gray", boxstyle="round,pad=0.4")
        )

        plt.tight_layout(pad=2.0)

        # ✅ Save to buffer and return as base64
        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight", dpi=150)
        plt.close()
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode("utf-8")

        print("[INFO] Final clean Keyness plot generated successfully.")
        return JSONResponse({"image": img_base64})

    except Exception as e:
        print("[ERROR] Keyness error:", e)
        return JSONResponse({"error": f"Keyness analysis failed: {e}"}, status_code=500)





