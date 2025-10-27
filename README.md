# Poem Pulse 🌙

A powerful poetry analysis web application that provides deep linguistic insights through advanced text analysis techniques.

## Features

- **📊 Word Frequency Analysis** - Distinctive keywords from two sets of writings
- **🎯 Semantic Clustering** - Word clustering with visualization using GloVe embeddings
- **❤️ Sentiment Analysis** - Emotion and sentiment scoring
- **🧠 Sensory-Motor Analysis** - Lancaster sensorimotor norms processing
- **📁 File Upload** - Support for text file uploads (TXT, DOCX formats)

## TechnologyStack

- **Frontend**: React.js with Create React App
- **Backend**: FastAPI (Python)
- **Analysis**: SciKit-Learn, Gensim, pandas, numpy, python-docx
- **Visualization**: Matplotlib
- **Communication**: RESTful API with CORS

## Quick Start

### Prerequisites

- **Node.js** (v14+) and **npm**
- **Python** (v3.9+)
- You can install these from their respective websites

### 1. Install Dependencies

**Frontend (Node.js packages):**
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

**Backend (Python packages):**
```bash
cd backend
pip install --only-binary :all: gensim
pip install fastapi uvicorn scikit-learn matplotlib pandas python-docx httpx nltk python-multipart
python -m nltk.downloader punkt stopwords wordnet omw-1.4 punkt_tab
cd ..
```

### 2. Start the Application

**Single Command (Recommended):**
```bash
npm run start:dev
```

**Expected Output:**
```
[Backend] INFO: Uvicorn running on http://127.0.0.1:8000
[Frontend] You can now view poem-pulse-react in the browser.
[Frontend] Local: http://localhost:3000
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start both frontend and backend servers |
| `npm run start:backend` | Start backend server only |
| `npm start` | Start frontend server only |
| `npm run build` | Build production version |
| `python start_all.py` | Alternative Python-based startup script |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/analyse` | POST | Upload text file for analysis |

## Package Dependencies

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "devDependencies": {
    "concurrently": "^9.2.1"
  }
}
```

### Backend (`requirements.txt`)
```
fastapi>=0.68.0
uvicorn[standard]>=0.15.0
scikit-learn>=1.0.0
gensim>=4.0.0
matplotlib>=3.5.0
pandas>=1.3.0
numpy>=1.21.0
python-docx>=0.8.11
httpx>=0.28.1
python-multipart>=0.0.20
nltk>=3.9.2
```

## File Structure

```
Poem-Pulse/
├── backend/
│   ├── backend.py             # FastAPI application
│   ├── clusters.py            # Word clustering & visualization
│   ├── glove50.kv             # Pre-trained GloVe embeddings
│   ├── glove50.kv.vectors.npy # Additional file for GloVe
│   ├── keyness.py             # Frequency analysis
│   ├── Lancaster_sensorimotor_norms_for_39707_words.csv
│   ├── requirements.txt
│   ├── sentiart.py            # Sentiment analysis
│   └── sensorimotor.py        # Sensorimotor norms
├── src/
│   ├── index.js
│   ├── /assets/
│   │   ├── App.css
│   │   ├── BackendStarting.css
│   │   ├── Background.png
│   │   ├── ExitPage.css
│   │   ├── index.css
│   │   ├── LoadingScreen.css
│   │   ├── Modal.css
│   │   ├── Poem-Pulse 2.png
│   │   ├── ResultsPage.css
│   │   └── ThankYouPage.css
│   ├── App.js                 # Main React component
│   ├── BackendStarting.js     # Check backend status
│   ├── ExitPage.js            # Summary and download results
│   ├── HttpHelper.js          # Send Http requests to backend
│   ├── LoadingScreen.js       # Loading state
│   ├── Modal.js               # Zoom functionality
│   ├── ResultsPage.js         # Results visualization
│   └── ThankYouPage.js        # Exit application confirmation
├── LICENSE
├── package-lock.json
├── package.json              # Frontend dependencies
├── README.md
├── server.js
└── start_all.py              # Python startup script
```

## Usage

1. **Upload a Text File**: Use the file upload interface on the frontend
2. **Analysis Processing**: The backend processes the uploaded text through:
   - Tokenization and preprocessing
   - Relative frequency calculation
   - Semantic clustering with PCA and DBSCAN
   - Sentiment analysis using GloVe embeddings
   - Sensorimotor norms analysis
3. **Visualization**: Results include plots, frequency tables, and sentiment scores

## Troubleshooting

**Command not recognized**
- Ensure npm is installed correctly: `npm -v` and `node -v`

**Gensim install error**
- Try: `pip install --only-binary :all: gensim`
- If it still fails, install a C++ compiler for your operating system

**Single command not working:**
- Ensure all dependencies installed: `npm install` and `pip install ...`
- Check `concurrently` package: `npm install --save-dev concurrently`

**Backend errors:**
- Check console logs for missing dependencies
- Verify Python packages in `backend/` directory
- Check FastAPI dependency: `pip install fastapi uvicorn`

**Frontend errors:**
- Ensure Node.js installed and run `npm install`
- Check React scripts: react-scripts should be installed

**File Upload Issues:**
- Batch upload only supports text file (.txt) inputs
- Supported formats: Plain text files (.txt), Word documents (.docx)
- Check file encoding (UTF-8 recommended for .txt files)
- Maximum recommended size: 10MB for all formats

## Development

The application uses hot-reload for both frontend and backend development. Changes to:
- **React components** (src/) auto-reload in browser
- **Python files** (backend/) auto-restart FastAPI server

Press `Ctrl+C` to stop both servers.

## License

MIT License - see LICENSE file for details.
