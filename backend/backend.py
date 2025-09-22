from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import base64
from keyness import relative_freq
from clusters import word_cluster
from sentiart import ratings
from sensorimotor import sensory_norm

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def tokenize(text):
    return [w.lower() for w in text.split()]

@app.get("/")
def home():
    return {"message": "It works???"}

@app.post("/analyse")
async def analyse(file: UploadFile):
    print("Recieved file: ", file.filename)
    text = (await file.read()).decode("utf-8")
    print("content len", len(text))

    text_processed = tokenize(text)

    #keyness statistic
    freq = relative_freq(text_processed)

    #word cluster
    custer_img = word_cluster(text_processed)

    #sentiart sentiment ratings
    rating = ratings(text_processed)

    #sensorimotor norms
    sensor = sensory_norm(text_processed)

    print("test1", len(custer_img))
    print("Preview:", custer_img[:50])

    return JSONResponse(content = {"relative frequency": freq, "cluster": custer_img, "ratings": rating, "sensorimotor": sensor})