import './App.css';
import { useState, useEffect } from 'react';
import { analyzeFile, sendShutdown } from "./test";
import LoadingScreen from './LoadingScreen';
import ResultsPage from './ResultsPage';
import ExitPage from './ExitPage';
import ThankYouPage from './ThankYouPage';
import BackendStarting from './BackendStarting';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('homepage');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let attempts = 0;
    const maxAttempts = 120; // ~2 minutes

    const checkBackend = async () => {
      attempts += 1;
      try {
        const res = await fetch('http://127.0.0.1:8000/', { method: 'GET' });
        if (!isCancelled && res.ok) {
          setIsBackendReady(true);
          return;
        }
      } catch (e) {
        // ignore and retry
      }
      if (!isCancelled && attempts < maxAttempts) {
        setTimeout(checkBackend, 1000);
      }
    };

    checkBackend();
    return () => { isCancelled = true; };
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.txt', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile(file);
        setErrorMessage(''); // Clear any previous error
        console.log('File selected:', file.name, 'Size:', file.size, 'bytes');
      } else {
        setErrorMessage('Please select a valid file type (.txt, .doc, or .docx)');
        event.target.value = ''; // Clear the input
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.txt', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile(file);
        setErrorMessage(''); // Clear any previous error
        console.log('File dropped:', file.name, 'Size:', file.size, 'bytes');
      } else {
        setErrorMessage('Please drop a valid file type (.txt, .doc, or .docx)');
      }
    }
  };

  const handleNext = () => {
    if (selectedFile && !isAnalyzing) {
      setErrorMessage(''); // Clear any previous error
      console.log('Next button clicked - starting analysis');
      setIsAnalyzing(true);
      setCurrentScreen('loading');
      
      // Start the actual file analysis
      analyzeFile(selectedFile)
        .then((data) => {
          console.log('Analysis completed:', data);
          setResults(data);
          setIsAnalyzing(false);
          setCurrentScreen('results');
        })
        .catch((err) => {
          console.error("Analysis failed:", err);
          setErrorMessage('Analysis failed. Please try again.');
          setIsAnalyzing(false);
          setCurrentScreen('homepage');
        });
    } else if (!selectedFile) {
      setErrorMessage('Please select a file before proceeding');
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked - returning to homepage');
    setIsAnalyzing(false);
    setCurrentScreen('homepage');
  };

  const handleBackToHome = () => {
    console.log('Back to home clicked - returning to homepage');
    setCurrentScreen('homepage');
  };

  const handleNextFromResults = () => {
    console.log('Next from results clicked - going to exit page');
    setCurrentScreen('exit');
  };

  const handleUploadAnother = () => {
    console.log('Upload another clicked - returning to homepage');
    setCurrentScreen('homepage');
    setSelectedFile(null);
    setResults(null);
    setErrorMessage('');
  };

  const handleExit = () => {
    console.log('Exit clicked - showing thank you page');
    setCurrentScreen('thank-you');
    sendShutdown();
  };

  const handleThankYouComplete = () => {
    console.log('Thank You page complete - closing application');
    window.close();
  };

  if (!isBackendReady) {
    return <BackendStarting message="Starting backend..." />;
  }

  if (currentScreen === 'loading') {
    return <LoadingScreen onCancel={handleCancel} />;
  }

  if (currentScreen === 'results') {
    return <ResultsPage 
      results={results}
      onBack={handleNextFromResults} />;
  }

  if (currentScreen === 'exit') {
    return <ExitPage 
      results={results}
      onUploadAnother={handleUploadAnother}
      onExit={handleExit} />;
  }

  if (currentScreen === 'thank-you') {
    return <ThankYouPage onComplete={handleThankYouComplete} />;
  }

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">Poem-Pulse</h1>
        <p className="tagline">Generating self-insights for creative writers with NLP.</p>
        
        <div className="description">
          <p>Upload your text and get insights on your work. Redefine your writing style and themes without your work leaving the device.</p>
        </div>

        <div 
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'file-selected' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="file-info">
              <p className="file-name">✓ {selectedFile.name}</p>
              <p className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              <button 
                className="remove-file"
                onClick={() => {
                  setSelectedFile(null);
                  setErrorMessage(''); // Clear any error when removing file
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <p>Drag and drop a text file here, or</p>
              <input
                type="file"
                id="file-upload"
                accept=".txt,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="browse-button">
                Browse...
              </label>
            </>
          )}
        </div>

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <button 
          className="next-button" 
          onClick={handleNext}
          disabled={!selectedFile || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default App;
