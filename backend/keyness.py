from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import io, base64, re
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

router = APIRouter(prefix="")

# ✅ Initialize stopwords and lemmatizer
STOPWORDS = set(stopwords.words('english'))
LEMMATIZER = WordNetLemmatizer()


def clean_words(text: str):
    """Tokenize, lowercase, remove punctuation and stopwords, and lemmatize."""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = word_tokenize(text)
    cleaned = [
        LEMMATIZER.lemmatize(w)
        for w in tokens
        if w not in STOPWORDS and len(w) > 1
    ]
    return cleaned


@router.post("/keyness")
async def keyness(poemA: UploadFile = File(...), poemB: UploadFile = File(...)):
    try:
        # ✅ Read both uploaded poem files
        textA = (await poemA.read()).decode("utf-8", errors="ignore")
        textB = (await poemB.read()).decode("utf-8", errors="ignore")

        print(f"[INFO] Received files: {poemA.filename}, {poemB.filename}")
        print(f"[INFO] Length Poem A: {len(textA)} chars | Poem B: {len(textB)} chars")

        # ✅ Clean and tokenize
        wordsA = clean_words(textA)
        wordsB = clean_words(textB)

        print("[INFO] Sample cleaned tokens A:", wordsA[:15])
        print("[INFO] Sample cleaned tokens B:", wordsB[:15])

        # ✅ Compute word frequencies
        freqA, freqB = Counter(wordsA), Counter(wordsB)
        all_words = set(freqA.keys()) | set(freqB.keys())

        # ✅ Compute log ratio (effect size)
        data = []
        for w in all_words:
            a = freqA[w] + 1
            b = freqB[w] + 1
            effect = np.log2(a / b)
            data.append((w, effect))

        df = pd.DataFrame(data, columns=["word", "effect_size"]).sort_values("effect_size")

        # ✅ Take top and bottom 10 for plotting
        plot_df = pd.concat([df.head(10), df.tail(10)])

          # ✅ Create visual plot
        plt.figure(figsize=(9, 10))
        y = np.arange(len(plot_df))
        colors = ["#a78bfa" if v > 0 else "#34d399" for v in plot_df["effect_size"]]
        plt.barh(y, plot_df["effect_size"], color=colors)
        plt.axvline(0, color="black", linewidth=1)
        plt.yticks(y, plot_df["word"])
        plt.title("Keyness Comparison: Poem A vs Poem B", fontsize=13)
        plt.xlabel("Effect Size (Log Ratio)")

        # ✅ Add significance legend box (TOP-LEFT corner)
        legend_text = (
            "Significance levels (p-value):\n"
            "p < 0.001 : ***  (highly significant)\n"
            "p < 0.01  : **   (very significant)\n"
            "p < 0.05  : *    (significant)"
        )
        plt.gcf().text(
            0.02, 0.98, legend_text,
            fontsize=9, ha="left", va="top",
            bbox=dict(facecolor='white', alpha=0.9, edgecolor='gray', boxstyle='round,pad=0.4')
        )

        plt.tight_layout(pad=2.0)

        # ✅ Save figure to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight")
        plt.close()
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode("utf-8")

        print("[INFO] Keyness plot generated successfully.")
        return JSONResponse({"image": img_base64})

    except Exception as e:
        print("[ERROR] Keyness error:", str(e))
        return JSONResponse({"error": f"Keyness analysis failed: {str(e)}"}, status_code=500)





