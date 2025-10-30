# ----------------- CLEAN + FIXED BACKEND -----------------
from fastapi import FastAPI, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io, os, asyncio, re
from docx import Document
from pydantic import BaseModel

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from io import BytesIO

# Routers and modules
from clusters import word_cluster
from sentiart import ratings
from sensorimotor import sensory_norm
from keyness import router as keyness_router  # ✅ Correct import for Keyness

# --------------------------------------------------------------------
# ✅ FASTAPI APP INITIALIZATION
# --------------------------------------------------------------------
app = FastAPI()

# Allow frontend connection
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

# ✅ Register the Keyness router — this is the only keyness route now
app.include_router(keyness_router)

# --------------------------------------------------------------------
# ✅ TEXT PROCESSING UTILITIES
# --------------------------------------------------------------------
STOPWORDS = {
    'a','an','and','the','is','are','was','were','be','been','being','am','do','does','did','doing','done',
    'to','of','in','on','for','from','by','with','at','into','onto','over','under','between','among','about','above','below','through','during','before','after','against','without','within','across','behind','beyond','around',
    'as','but','if','than','then','that','this','these','those','such','so','or','nor','not','no','only','just','very','too',
    'i','me','my','mine','we','us','our','ours','you','your','yours','he','him','his','she','her','hers','they','them','their','theirs','it','its','one','ones','someone','something',
    'there','here','where','when','how','why','what','which','who','whom','whose',
    'can','could','will','would','shall','should','may','might','must',
    'also','ever','never','again','still','yet','each','every','either','neither','both','all','any','some','many','much','few','more','most','less','least'
}

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text content from uploaded file based on its extension."""
    file_extension = filename.lower().split('.')[-1]
    
    if file_extension == 'txt':
        try:
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                return file_content.decode('latin-1')
            except UnicodeDecodeError:
                return file_content.decode('utf-8', errors='ignore')
    
    elif file_extension in ['doc', 'docx']:
        try:
            doc_stream = io.BytesIO(file_content)
            doc = Document(doc_stream)
            text_content = [p.text for p in doc.paragraphs]
            return '\n'.join(text_content)
        except Exception as e:
            print(f"Error parsing Word document: {e}")
            return ""
    
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")

def tokenize(text):
    """Tokenize and filter: remove punctuation and stopwords."""
    raw_tokens = re.findall(r"[A-Za-z']+", text)
    normalized = [t.lower().replace("'", "") for t in raw_tokens]
    return [w for w in normalized if len(w) > 1 and w not in STOPWORDS]

def _strip_utf8_bom(data: bytes) -> bytes:
    """Remove UTF-8 BOM if present."""
    if data.startswith(b"\xef\xbb\xbf"):
        return data[3:]
    return data

class TextPayload(BaseModel):
    text: str

# --------------------------------------------------------------------
# ✅ ROUTES
# --------------------------------------------------------------------
@app.get("/")
def home():
    return {"message": "It works 🎉"}

@app.post("/analyse")
async def analyse(file: UploadFile):
    print("Received file:", file.filename)
    
    file_extension = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
    if file_extension not in ['txt', 'doc', 'docx']:
        return JSONResponse(content={"error": "Unsupported file format."}, status_code=400)

    if file_extension == 'doc':
        return JSONResponse(content={"error": ".doc not supported, use .txt or .docx"}, status_code=400)

    try:
        file_content = await file.read()
        if file_extension == 'txt':
            file_content = _strip_utf8_bom(file_content)
        text = extract_text_from_file(file_content, file.filename)
        if not text.strip():
            return JSONResponse(content={"error": "No readable text found."}, status_code=400)

        print("Content length:", len(text))
        print("First 100 chars:", text[:100])
        
        text_processed = tokenize(text)
        cluster_imgs = word_cluster(text_processed)
        rating = ratings(text_processed)
        sensor = sensory_norm(text_processed)

        cluster_data = {
            "simple": cluster_imgs.get("simple", ""),
            "labeled": cluster_imgs.get("labeled", "")
        }

        return JSONResponse(content={
            "cluster": cluster_data,
            "ratings": rating,
            "sensorimotor": sensor,
            "text": text  # include user text for frontend Plotly
        })
    except Exception as e:
        print(f"Error processing file: {e}")
        return JSONResponse(content={"error": f"Failed to process file: {str(e)}"}, status_code=500)

@app.post("/analyse-text")
async def analyse_text(payload: TextPayload):
    try:
        text = payload.text or ""
        if not text.strip():
            return JSONResponse(content={"error": "No text provided."}, status_code=400)

        text_processed = tokenize(text)
        cluster_imgs = word_cluster(text_processed)
        rating = ratings(text_processed)
        sensor = sensory_norm(text_processed)

        cluster_data = {
            "simple": cluster_imgs.get("simple", ""),
            "labeled": cluster_imgs.get("labeled", "")
        }

        return JSONResponse(content={
            "cluster": cluster_data,
            "ratings": rating,
            "sensorimotor": sensor,
            "text": text  # include user text for frontend Plotly
        })
    except Exception as e:
        print(f"Error processing raw text: {e}")
        return JSONResponse(content={"error": f"Failed to process text: {str(e)}"}, status_code=500)

@app.post("/cluster-data")
async def cluster_data(payload: dict):
    text = payload.get("text", "")
    if not text.strip():
        return JSONResponse(content={"error": "No text provided."}, status_code=400)
    from clusters import word_cluster
    from backend import tokenize
    tokens = tokenize(text)
    result = word_cluster(tokens, return_data=True)
    return JSONResponse(content={"points": result.get('points', []), "summaries": result.get('summaries', [])})

# --------------------------------------------------------------------
# ✅ SHUTDOWN ENDPOINT
# --------------------------------------------------------------------
@app.post("/shutdown")
async def shutdown():
    print("Shutdown initiated...")
    asyncio.create_task(_shutdown_server())
    return {"shutdown": True}

async def _shutdown_server():
    await asyncio.sleep(1)
    os._exit(1)


