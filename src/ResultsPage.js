import './ResultsPage.css';
import { useState } from 'react';
import Modal from './Modal';

function ResultsPage({ results, onBack }) {
  const [openModal, setOpenModal] = useState(null); // 'freq' | 'cluster' | 'sentiment' | 'sensor'
  const [sentimentView, setSentimentView] = useState('positive'); // 'positive' | 'negative'
  const [freqOrder, setFreqOrder] = useState('desc'); // 'asc' | 'desc'
  const [sentimentOrder, setSentimentOrder] = useState('desc'); // 'asc' | 'desc'

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
          <div className="results-panel" onClick={() => setOpenModal('freq')} style={{cursor:'zoom-in'}}>
            <h2 className="panel-title">Word Frequency Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {frequencyData ? (
                  <div className="frequency-list">
                    <div className="ui-controls" style={{justifyContent:'space-between'}} onClick={(e)=>e.stopPropagation()}>
                      <p className="frequency-description" style={{margin:0}}>Top words by relative frequency:</p>
                      <div className="ui-controls" style={{margin:0}}>
                        <label htmlFor="freq-sort" className="ui-label">Sort:</label>
                        <select id="freq-sort" className="ui-select" value={freqOrder} onChange={(e)=>setFreqOrder(e.target.value)}>
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </select>
                      </div>
                    </div>
                    <ul className="frequency-items">
                      {Object.entries(frequencyData)
                        .sort((a,b) => freqOrder==='desc' ? Number(b[1]) - Number(a[1]) : Number(a[1]) - Number(b[1]))
                        .slice(0, 20)
                        .map(([word, freq]) => (
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
          <div className="results-panel" onClick={() => setOpenModal('cluster')} style={{cursor:'zoom-in'}}>
            <h2 className="panel-title">Semantic Clustering Visualization</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {clusterData && (clusterData.simple || clusterData.plot) ? (
                  <div style={{width: '100%'}}>
                    <img
                      src={`data:image/png;base64,${clusterData.simple || clusterData.plot}`}
                      alt="Word clustering visualization"
                      className="cluster-image"
                    />
                  </div>
                ) : (
                  <p>No clustering visualization available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sentiment Analysis Panel */}
          <div className="results-panel" onClick={() => setOpenModal('sentiment')} style={{cursor:'zoom-in'}}>
            <h2 className="panel-title">Sentiment Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {sentimentData ? (
                  <div className="sentiment-analysis">
                    <div className="sentiment-summary highlight">
                      {(() => {
                        const validSentiments = Object.entries(sentimentData).filter(([word, score]) => score !== null);
                        const avgSentiment = validSentiments.reduce((sum, [_, score]) => sum + score, 0) / validSentiments.length;
                        const positiveWords = validSentiments.filter(([_, score]) => score > 0).length;
                        const negativeWords = validSentiments.filter(([_, score]) => score < 0).length;
                        
                        return (
                          <div className="sentiment-stats">
                            <p><strong>Overall Sentiment:</strong> {avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}</p>
                            <p><strong>Average Score:</strong> {avgSentiment.toFixed(3)}</p>
                            <p><strong>Positive words:</strong> {positiveWords}, <strong>Negative words:</strong> {negativeWords}</p>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="ui-controls" onClick={(e)=>e.stopPropagation()}>
                      <div className="ui-controls" style={{margin:0}}>
                        <label htmlFor="sentiment-view" className="ui-label">View:</label>
                        <select id="sentiment-view" className="ui-select" value={sentimentView} onChange={(e)=>setSentimentView(e.target.value)}>
                          <option value="positive">Positive</option>
                          <option value="negative">Negative</option>
                        </select>
                      </div>
                      <div className="ui-controls" style={{margin:0}}>
                        <label htmlFor="sentiment-sort" className="ui-label">Sort:</label>
                        <select id="sentiment-sort" className="ui-select" value={sentimentOrder} onChange={(e)=>setSentimentOrder(e.target.value)}>
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </select>
                      </div>
                    </div>
                    <p className="sentiment-description">{sentimentView==='positive' ? 'Words with positive sentiment' : 'Words with negative sentiment'}:</p>
                    <ul className="sentiment-items">
                      {Object.entries(sentimentData)
                        .filter(([_, s]) => s !== null && (sentimentView==='positive' ? s > 0 : s < 0))
                        .sort((a,b) => sentimentOrder==='desc' ? (Number(b[1]) - Number(a[1])) : (Number(a[1]) - Number(b[1])))
                        .slice(0, 30)
                        .map(([word, score]) => (
                          <li key={word} className="sentiment-item">
                            <span className="word">{word}</span>
                            <span className={`sentiment-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'}`}>
                              {score.toFixed(3)}
                            </span>
                          </li>
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
          <div className="results-panel" onClick={() => setOpenModal('sensor')} style={{cursor:'zoom-in'}}>
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

        {/* Modals */}
        <Modal open={openModal==='freq'} title="Word Frequency Analysis" onClose={() => setOpenModal(null)}>
          {frequencyData ? (
            <div style={{maxHeight:'70vh', overflow:'auto'}}>
              <div className="ui-controls right" style={{marginBottom:10}}>
                <label htmlFor="freq-sort-modal" className="ui-label">Sort:</label>
                <select id="freq-sort-modal" className="ui-select" value={freqOrder} onChange={(e)=>setFreqOrder(e.target.value)}>
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <ul className="frequency-items">
                {Object.entries(frequencyData)
                  .sort((a,b) => freqOrder==='desc' ? Number(b[1]) - Number(a[1]) : Number(a[1]) - Number(b[1]))
                  .map(([word, freq]) => (
                  <li key={word} className="frequency-item">
                    <span className="word">{word}</span>
                    <span className="frequency">
                      {typeof freq === 'number' && freq > 0 && freq < 1 
                        ? `${(freq * 100).toFixed(2)}%` 
                        : Number(freq).toFixed(6)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : <p>No frequency data found</p>}
        </Modal>

        <Modal open={openModal==='cluster'} title="Semantic Clustering Visualization" onClose={() => setOpenModal(null)} fullscreen>
          {clusterData && (clusterData.labeled || clusterData.plot) ? (
            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <img
                src={`data:image/png;base64,${clusterData.labeled || clusterData.plot}`}
                alt="Word clustering visualization"
                style={{
                  width:'100%',
                  height:'100%',
                  objectFit:'contain',
                  borderRadius:12,
                  display:'block'
                }}
              />
            </div>
          ) : <p>No clustering visualization available</p>}
        </Modal>

        <Modal open={openModal==='sentiment'} title="Sentiment Analysis" onClose={() => setOpenModal(null)}>
          {sentimentData ? (
            <div className="sentiment-analysis" style={{maxHeight:'70vh', overflow:'auto'}}>
              <div className="sentiment-summary highlight">
                {(() => {
                  const validSentiments = Object.entries(sentimentData).filter(([word, score]) => score !== null);
                  const avgSentiment = validSentiments.reduce((sum, [_, score]) => sum + score, 0) / validSentiments.length;
                  const positiveWords = validSentiments.filter(([_, score]) => score > 0).length;
                  const negativeWords = validSentiments.filter(([_, score]) => score < 0).length;
                  return (
                    <div className="sentiment-stats">
                      <p><strong>Overall Sentiment:</strong> {avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}</p>
                      <p><strong>Average Score:</strong> {avgSentiment.toFixed(3)}</p>
                      <p><strong>Positive words:</strong> {positiveWords}, <strong>Negative words:</strong> {negativeWords}</p>
                    </div>
                  );
                })()}
              </div>
              <div className="ui-controls" style={{marginBottom:12}}>
                <div className="ui-controls" style={{margin:0}}>
                  <label htmlFor="sentiment-view-modal" className="ui-label">View:</label>
                  <select id="sentiment-view-modal" className="ui-select" value={sentimentView} onChange={(e)=>setSentimentView(e.target.value)}>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                <div className="ui-controls" style={{margin:0}}>
                  <label htmlFor="sentiment-sort-modal" className="ui-label">Sort:</label>
                  <select id="sentiment-sort-modal" className="ui-select" value={sentimentOrder} onChange={(e)=>setSentimentOrder(e.target.value)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
              <ul className="sentiment-items">
                {Object.entries(sentimentData)
                  .filter(([_, s]) => s !== null && (sentimentView==='positive' ? s > 0 : s < 0))
                  .sort((a,b) => sentimentOrder==='desc' ? (Number(b[1]) - Number(a[1])) : (Number(a[1]) - Number(b[1])))
                  .map(([word, score]) => (
                    <li key={word} className="sentiment-item">
                      <span className="word">{word}</span>
                      <span className={`sentiment-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'}`}>
                        {score.toFixed(3)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : <p>No sentiment data found</p>}
        </Modal>

        <Modal open={openModal==='sensor'} title="Sensorimotor Norms Analysis" onClose={() => setOpenModal(null)}>
          {sensorimotorData ? (
            <div className="sensorimotor-analysis" style={{maxHeight:'70vh', overflow:'auto'}}>
              <div className="sensorimotor-items">
                {Object.entries(sensorimotorData).map(([word, norms]) => (
                  norms && (
                    <div key={word} className="sensorimotor-item">
                      <h4 className="norms-word">{word}</h4>
                      <div className="norms-details">
                        {Object.entries(norms).map(([key, value]) => (
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
          ) : <p>No sensorimotor data found</p>}
        </Modal>
      </div>
    </div>
  );
}

export default ResultsPage;
