from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
import io
import base64
from keyness import relative_freq
from clusters import word_cluster
from sentiart import ratings

app = FastAPI()

testtxt = "a b c"
testtxt.split()[0]

def tokenize(text):
    return [w.lower() for w in text.split()]

@app.get("/")
def home():
    return {"message": "It works???"}

@app.post("/analyse")
async def analyse(file: UploadFile):
    text = (await file.read()).decode("utf-8")

    text_processed = tokenize(text)

    #keyness statistic
    freq = relative_freq(text_processed)

    #word cluster
    custer_img = word_cluster(text_processed)

    #sentiart sentiment ratings
    rating = ratings(text_processed)

    return JSONResponse(content = {"relative frequency": freq, "cluster": custer_img, "ratings": rating})