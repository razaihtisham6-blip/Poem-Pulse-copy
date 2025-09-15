import './ResultsPage.css';

function ResultsPage({ onBack }) {
  return (
    <div className="results-container">
      <div className="results-content">
        <h1 className="results-title">Analysis Results</h1>
        
        <div className="results-grid">
          {/* Keyness Statistics Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Keyness Statistics</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                <p>Results coming soon...</p>
              </div>
            </div>
          </div>

          {/* Semantic Clustering Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Semantic Clustering</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                <p>Results coming soon...</p>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Sentiment Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                <p>Results coming soon...</p>
              </div>
            </div>
          </div>

          {/* Sensorimotor Norms Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Sensorimotor Norms</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                <p>Results coming soon...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="back-button" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
