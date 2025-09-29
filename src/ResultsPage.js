import './ResultsPage.css';
//import React from "react";

function ResultsPage({ results, onBack }) {
  if (!results) return <p>No results received.</p>;

  const frequencyData = results.relative_frequency;
  const sentimentData = results.ratings;
  const clusterData = results.cluster;
  const sensorimotorData = results.sensorimotor;

  return (
    <div className="results-container">
      <div className="results-content">
        <h1 className="results-title">Analysis Results</h1>
        
        <div className="results-grid">
          {/* Relative Frequency Statistics Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Word Frequency Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {frequencyData ? (
                  <div className="frequency-list">
                    <p className="frequency-description">Top words by relative frequency:</p>
                    <ul className="frequency-items">
                      {Object.entries(frequencyData).slice(0, 20).map(([word, freq]) => (
                        <li key={word} className="frequency-item">
                          <span className="word">{word}</span>: 
                          <span className="frequency">
                            {typeof freq === 'number' && freq > 0 && freq < 1 
                              ? `${(freq * 100).toFixed(2)}%` 
                              : freq.toFixed(6)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No frequency data found</p>
                )}
              </div>
            </div>
          </div>

          {/* Semantic Clustering Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Semantic Clustering Visualization</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {clusterData && clusterData.plot ? (
                  <img
                    src={`data:image/png;base64,${clusterData.plot}`}
                    alt="Word clustering visualization"
                    className="cluster-image"
                  />
                ) : (
                  <p>No clustering visualization available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sentiment Analysis Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Sentiment Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {sentimentData ? (
                  <div className="sentiment-analysis">
                    <p className="sentiment-description">Sentiment scores for words in your text:</p>
                    <div className="sentiment-summary">
                      {(() => {
                        const validSentiments = Object.entries(sentimentData).filter(([word, score]) => score !== null);
                        const avgSentiment = validSentiments.reduce((sum, [_, score]) => sum + score, 0) / validSentiments.length;
                        const positiveWords = validSentiments.filter(([_, score]) => score > 0).length;
                        const negativeWords = validSentiments.filter(([_, score]) => score < 0).length;
                        
                        return (
                          <div className="sentiment-stats">
                            <p><strong>Overall Sentiment:</strong> {avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}</p>
                            <p><strong>Average Score:</strong> {avgSentiment.toFixed(3)}</p>
                            <p><strong>Positive words:</strong> {positiveWords} | <strong>{negativeWords}</strong></p>
                          </div>
                        );
                      })()}
                    </div>
                    <ul className="sentiment-items">
                      {Object.entries(sentimentData).slice(0, 15).map(([word, score]) => (
                        score !== null && (
                          <li key={word} className="sentiment-item">
                            <span className="word">{word}</span>: 
                            <span className={`sentiment-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'}`}>
                              {score.toFixed(3)}
                            </span>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No sentiment data found</p>
                )}
              </div>
            </div>
          </div>

          {/* Sensorimotor Norms Panel */}
          <div className="results-panel">
            <h2 className="panel-title">Sensorimotor Norms Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {sensorimotorData ? (
                  <div className="sensorimotor-analysis">
                    <p className="sensorimotor-description">Sensorimotor features of words in your text:</p>
                    <div className="sensorimotor-items">
                      {Object.entries(sensorimotorData).slice(0, 10).map(([word, norms]) => (
                        norms && (
                          <div key={word} className="sensorimotor-item">
                            <h4 className="norms-word">{word}</h4>
                            <div className="norms-details">
                              {Object.entries(norms).slice(1, 6).map(([key, value]) => (
                                <div key={key} className="norm-item">
                                  <span className="norm-label">{key.replace(/_/g, ' ')}:</span>
                                  <span className="norm-value">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>No sensorimotor data found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="next-button" onClick={onBack}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
