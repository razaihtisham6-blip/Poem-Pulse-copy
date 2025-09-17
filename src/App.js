import './App.css';
import { useState } from 'react';
import LoadingScreen from './LoadingScreen';
import ResultsPage from './ResultsPage';
import ExitPage from './ExitPage';
import ThankYouPage from './ThankYouPage';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('homepage');
  const [errorMessage, setErrorMessage] = useState('');

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
        // Handle file processing here
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
        // Handle file processing here
      } else {
        setErrorMessage('Please drop a valid file type (.txt, .doc, or .docx)');
      }
    }
  };

  const handleNext = () => {
    if (selectedFile) {
      setErrorMessage(''); // Clear any previous error
      console.log('Next button clicked - navigating to loading screen');
      setCurrentScreen('loading');
    } else {
      setErrorMessage('Please select a file before proceeding');
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked - returning to homepage');
    setCurrentScreen('homepage');
  };

  const handleLoadingComplete = () => {
    console.log('Loading completed - navigating to results');
    setCurrentScreen('results');
  };

  const handleNextToExit = () => {
    console.log('Next button clicked - navigating to exit page');
    setCurrentScreen('exit');
  };

  const handleUploadAnother = () => {
    console.log('Upload another clicked - returning to homepage');
    setSelectedFile(null);
    setErrorMessage('');
    setCurrentScreen('homepage');
  };

  const handleExit = () => {
    console.log('Exit clicked - navigating to thank you page');
    setCurrentScreen('thankyou');
  };

  if (currentScreen === 'loading') {
    return <LoadingScreen onCancel={handleCancel} onComplete={handleLoadingComplete} />;
  }

  if (currentScreen === 'results') {
    return <ResultsPage onNext={handleNextToExit} />;
  }

  if (currentScreen === 'exit') {
    return <ExitPage onUploadAnother={handleUploadAnother} onExit={handleExit} />;
  }

  if (currentScreen === 'thankyou') {
    return <ThankYouPage />;
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

        <button className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
