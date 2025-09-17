import './LoadingScreen.css';
import { useEffect, useState } from 'react';

function LoadingScreen({ onCancel, onComplete, setAnalysisResult, selectedFile }) {
  const [error, setError] = useState('');

  useEffect(() => {
    const sendForAnalysis = async (text) => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        if (!response.ok) {
          const detail = await response.text().catch(() => '');
          // Most common case: Ollama not running → backend returns 502
          if (response.status === 502) {
            setError('Ollama is not running. Please start Ollama and try again.');
          } else {
            setError('Analysis service error. Please try again.');
          }
          return;
        }
        const data = await response.json();
        setAnalysisResult && setAnalysisResult(data.result || '');
        if (onComplete) onComplete();
      } catch (e) {
        setError('Cannot reach local analysis service. Is Ollama running?');
      }
    };

    const readFileText = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });

    (async () => {
      if (selectedFile) {
        try {
          const text = await readFileText(selectedFile);
          await sendForAnalysis(text);
        } catch (e) {
          setError('Failed to read file.');
        }
      } else {
        setError('No file selected. Please go back and choose a file.');
      }
    })();
  }, [onComplete, selectedFile, setAnalysisResult]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <h1 className="loading-title">Analyzing your work locally..</h1>
        
        <div className="spinner-container">
          <div className="spinner">
            <div className="spinner-arc"></div>
          </div>
        </div>

        <div className="analysis-steps">
          <ul>
            <li>Reading from your file</li>
            <li>Calculating keyness statistics</li>
            <li>Building semantic clusters</li>
            <li>Running Sentiment Analysis</li>
            <li>Matching sensorimotor Norms</li>
          </ul>
        </div>

        {error && (
          <div className="error-message" style={{ marginTop: '12px' }}>
            {error}
          </div>
        )}

        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default LoadingScreen;
