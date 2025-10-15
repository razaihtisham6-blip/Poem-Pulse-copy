# ----------------- ORIGINAL + MINIMAL EDITS -----------------
from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
# REMOVED (redundant/unused): import base64   # ← removed because it isn't used anywhere

from docx import Document
from keyness import relative_freq
from clusters import word_cluster
from sentiart import ratings
from sensorimotor import sensory_norm

# ===== ADDED: extra imports for the new raw-text endpoint and small helpers =====
from pydantic import BaseModel  # ADDED
# ===============================================================================

import os, asyncio

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

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text content from uploaded file based on its extension."""
    file_extension = filename.lower().split('.')[-1]
    
    if file_extension == 'txt':
        try:
            # Try UTF-8 first
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                # Fallback to latin-1 if UTF-8 fails
                return file_content.decode('latin-1')
            except UnicodeDecodeError:
                # Final fallback
                return file_content.decode('utf-8', errors='ignore')
    
    elif file_extension in ['doc', 'docx']:
        try:
            # Save content to BytesIO for docx processing
            doc_stream = io.BytesIO(file_content)
            doc = Document(doc_stream)
            
            # Extract text from all paragraphs
            text_content = []
            for paragraph in doc.paragraphs:
                text_content.append(paragraph.text)
            
            # Join all paragraphs with newlines
            return '\n'.join(text_content)
            
        except Exception as e:
            print(f"Error parsing Word document: {e}")
            return ""
    
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")

def tokenize(text):
    return [w.lower() for w in text.split()]

# ===== ADDED: tiny helper to strip UTF-8 BOM from some Windows-exported .txt files =====
def _strip_utf8_bom(data: bytes) -> bytes:
    """Remove UTF-8 BOM if present to avoid a weird first token."""
    if data.startswith(b"\xef\xbb\xbf"):
        return data[3:]
    return data
# =======================================================================================

# ===== ADDED: schema for an alternate endpoint that accepts raw text (no file upload) ===
class TextPayload(BaseModel):
    text: str
# =======================================================================================

@app.get("/")
def home():
    return {"message": "It works???"}

@app.post("/analyse")
async def analyse(file: UploadFile):
    print("Received file: ", file.filename)
    
    # Validate file type
    file_extension = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
    if file_extension not in ['txt', 'doc', 'docx']:
        return JSONResponse(
            content={"error": "Unsupported file format. Please upload a .txt, .doc, or .docx file."},
            status_code=400
        )

    # ===== ADDED: guard because python-docx doesn't support legacy .doc =====
    if file_extension == 'doc':
        return JSONResponse(
            content={"error": ".doc is not supported. Please upload a .txt or .docx file."},
            status_code=400
        )
    # =======================================================================

    try:
        # Read file content
        file_content = await file.read()

        # ===== ADDED: strip BOM for .txt to keep your tokens clean ==========
        if file_extension == 'txt':
            file_content = _strip_utf8_bom(file_content)
        # ===================================================================

        # Extract text based on file type
        text = extract_text_from_file(file_content, file.filename)
        
        if not text.strip():
            return JSONResponse(
                content={"error": "No readable text found in the uploaded file."},
                status_code=400
            )
        
        print("Content length:", len(text))
        print("First 100 chars:", text[:100])
        
        text_processed = tokenize(text)

        #keyness statistic
        freq = relative_freq(text_processed)

        #word cluster
        custer_img = word_cluster(text_processed)

        #sentiart sentiment ratings
        rating = ratings(text_processed)

        #sensorimotor norms
        sensor = sensory_norm(text_processed)

        print("Clustering image length:", len(custer_img))
        print("Clustering preview:", custer_img[:50])

        # Organize cluster data properly
        cluster_data = {"plot": custer_img}
        
        return JSONResponse(content = {
            "relative_frequency": freq, 
            "cluster": cluster_data, 
            "ratings": rating, 
            "sensorimotor": sensor
        })
    
    except Exception as e:
        print(f"Error processing file: {e}")
        return JSONResponse(
            content={"error": f"Failed to process file: {str(e)}"},
            status_code=500
        )

# ===== ADDED: alternate endpoint to analyse raw text directly (no file upload) =========
@app.post("/analyse-text")
async def analyse_text(payload: TextPayload):
    try:
        text = payload.text or ""
        if not text.strip():
            return JSONResponse(
                content={"error": "No text provided."},
                status_code=400
            )

        print("Content length (raw text):", len(text))
        print("First 100 chars:", text[:100])

        text_processed = tokenize(text)

        freq = relative_freq(text_processed)
        custer_img = word_cluster(text_processed)
        rating = ratings(text_processed)
        sensor = sensory_norm(text_processed)

        cluster_data = {"plot": custer_img}

        return JSONResponse(content={
            "relative_frequency": freq,
            "cluster": cluster_data,
            "ratings": rating,
            "sensorimotor": sensor
        })
    except Exception as e:
        print(f"Error processing raw text: {e}")
        return JSONResponse(
            content={"error": f"Failed to process text: {str(e)}"},
            status_code=500
        )
    
@app.post("/shutdown")
async def shutdown():
    print("Shutdown initiated...")
    asyncio.create_task(_shutdown_server())
    return {"shutdown": True}

async def _shutdown_server():
    await asyncio.sleep(1)  # Give the response time to be sent
    os._exit(1)
# =======================================================================================
