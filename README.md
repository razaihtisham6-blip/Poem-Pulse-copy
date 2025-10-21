# Poem Pulse 🌙

A powerful poetry analysis web application that provides deep linguistic insights through advanced text analysis techniques.

## Features

- **📊 Word Frequency Analysis** - Relative frequency statistics
- **🎯 Semantic Clustering** - Word clustering with visualization using GloVe embeddings
- **❤️ Sentiment Analysis** - Emotion and sentiment scoring
- **🧠 Sensory-Motor Analysis** - Lancaster sensorimotor norms processing
- **📁 File Upload** - Support for text file uploads (TXT, DOC, DOCX formats)

## TechnologyStack

- **Frontend**: React.js with Create React App
- **Backend**: FastAPI (Python)
- **Analysis**: SciKit-Learn, Gensim, pandas, numpy, python-docx
- **Visualization**: Matplotlib
- **Communication**: RESTful API with CORS

## Quick Start

### Prerequisites

- **Node.js** (v14+) and **npm**
- **Python** (v3.8+)

### 1. Install Dependencies

**Frontend (Node.js packages):**
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

**Backend (Python packages):**
```bash
cd backend
pip install fastapi uvicorn scikit-learn gensim matplotlib pandas numpy python-docx httpx
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
```

## File Structure

```
Poem-Pulse/
├── backend/
│   ├── backend.py              # FastAPI application
│   ├── clusters.py            # Word clustering & visualization
│   ├── keyness.py             # Frequency analysis
│   ├── sentiart.py            # Sentiment analysis
│   ├── sensorimotor.py        # Sensorimotor norms
│   ├── glove50.kv             # Pre-trained GloVe embeddings
│   └── Lancaster_sensorimotor_norms_for_39707_words.csv
├── src/
│   ├── App.js                 # Main React component
│   ├── LoadingScreen.js       # Loading state
│   └── ResultsPage.js         # Results visualization
├── package.json              # Frontend dependencies
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

**Single command not working:**
- Ensure all dependencies installed: `npm install` and `pip install ...`
- Check `concurrently` package: `npm install --save-dev concurrently`

**Backend errors:**
- Verify Python packages in `backend/` directory
- Check FastAPI dependency: `pip install fastapi uvicorn`

**Frontend errors:**
- Ensure Node.js installed and run `npm install`
- Check React scripts: react-scripts should be installed

**File Upload Issues:**
- Supported formats: Plain text files (.txt), Word documents (.doc, .docx)
- Check file encoding (UTF-8 recommended for .txt files)
- Maximum recommended size: 10MB for all formats

## Development

The application uses hot-reload for both frontend and backend development. Changes to:
- **React components** (src/) auto-reload in browser
- **Python files** (backend/) auto-restart FastAPI server

Press `Ctrl+C` to stop both servers.

## License

MIT License - see LICENSE file for details.
