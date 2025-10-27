import './assets/LoadingScreen.css';

function LoadingScreen({ onCancel }) {
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

        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default LoadingScreen;
