import './assets/ResultsPage.css';
import { useState, useRef } from 'react';
import Modal from './Modal';

function ResultsPage({ results, onBack }) {
  const [openModal, setOpenModal] = useState(null);
  const [sentimentView, setSentimentView] = useState('positive');
  const [sentimentOrder, setSentimentOrder] = useState('desc');
  const [keynessImage, setKeynessImage] = useState(null);

  if (!results) return <p>No results received.</p>;

  const sentimentData = results.ratings;
  const clusterData = results.cluster;
  const sensorimotorData = results.sensorimotor;

  //safety
  const sensorimotor = sensorimotorData && sensorimotorData.data ? sensorimotorData.data : sensorimotorData;

  return (
    <div className="results-container">
      <div className="results-content">
        <h1 className="results-title">Analysis Results</h1>
        <h3 className="results-subtitle">Click on panels to view more information</h3>

        <div className="results-grid">
          {/* 🔁 Keyness Statistics Panel */}
          <div className="results-panel" style={{ cursor: 'default' }}>
            <h2 className="panel-title">Keyness Statistics</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                <KeynessAnalysis
                  setKeynessImage={setKeynessImage}
                  setOpenModal={setOpenModal}
                />
              </div>
            </div>
          </div>

          {/* Semantic Clustering Panel */}
          <div
            className="results-panel"
            onClick={() => setOpenModal('cluster')}
            style={{ cursor: 'zoom-in' }}
          >
            <h2 className="panel-title">Semantic Clustering Visualization</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {clusterData && (clusterData.simple || clusterData.plot) ? (
                  <div style={{ width: '100%' }}>
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
          <div
            className="results-panel"
            onClick={() => setOpenModal('sentiment')}
            style={{ cursor: 'zoom-in' }}
          >
            <h2 className="panel-title">Sentiment Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {sentimentData ? (
                  <div className="sentiment-analysis">
                    <div className="sentiment-summary highlight">
                      {(() => {
                        const validSentiments = Object.entries(sentimentData).filter(
                          ([_, score]) => score !== null
                        );
                        const avgSentiment =
                          validSentiments.reduce((sum, [_, score]) => sum + score, 0) /
                          validSentiments.length;
                        const positiveWords = validSentiments.filter(
                          ([_, score]) => score > 0
                        ).length;
                        const negativeWords = validSentiments.filter(
                          ([_, score]) => score < 0
                        ).length;
                        return (
                          <div className="sentiment-stats">
                            <p>
                              <strong>Overall Sentiment:</strong>{' '}
                              {avgSentiment > 0
                                ? 'Positive'
                                : avgSentiment < 0
                                ? 'Negative'
                                : 'Neutral'}
                            </p>
                            <p>
                              <strong>Average Score:</strong>{' '}
                              {avgSentiment.toFixed(3)}
                            </p>
                            <p>
                              <strong>Positive words:</strong> {positiveWords},{' '}
                              <strong>Negative words:</strong> {negativeWords}
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    <div
                      className="ui-controls"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="ui-controls" style={{ margin: 0 }}>
                        <label htmlFor="sentiment-view" className="ui-label">
                          View:
                        </label>
                        <select
                          id="sentiment-view"
                          className="ui-select"
                          value={sentimentView}
                          onChange={(e) => setSentimentView(e.target.value)}
                        >
                          <option value="positive">Positive</option>
                          <option value="negative">Negative</option>
                        </select>
                      </div>

                      <div className="ui-controls" style={{ margin: 0 }}>
                        <label htmlFor="sentiment-sort" className="ui-label">
                          Sort:
                        </label>
                        <select
                          id="sentiment-sort"
                          className="ui-select"
                          value={sentimentOrder}
                          onChange={(e) => setSentimentOrder(e.target.value)}
                        >
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </select>
                      </div>
                    </div>

                    <p className="sentiment-description">
                      {sentimentView === 'positive'
                        ? 'Words with positive sentiment'
                        : 'Words with negative sentiment'}
                      :
                    </p>
                    <ul className="sentiment-items">
                      {Object.entries(sentimentData)
                        .filter(
                          ([_, s]) =>
                            s !== null &&
                            (sentimentView === 'positive' ? s > 0 : s < 0)
                        )
                        .sort((a, b) =>
                          sentimentOrder === 'desc'
                            ? Number(b[1]) - Number(a[1])
                            : Number(a[1]) - Number(b[1])
                        )
                        .slice(0, 30)
                        .map(([word, score]) => (
                          <li key={word} className="sentiment-item">
                            <span className="word">{word}</span>
                            <span
                              className={`sentiment-score ${
                                score > 0
                                  ? 'positive'
                                  : score < 0
                                  ? 'negative'
                                  : 'neutral'
                              }`}
                            >
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
          <div
            className="results-panel"
            onClick={() => setOpenModal('sensor')}
            style={{ cursor: 'zoom-in' }}
          >
            <h2 className="panel-title">Sensorimotor Norms Analysis</h2>
            <div className="panel-content">
              <div className="placeholder-content">
                {sensorimotor ? (
                  <div className="sensorimotor-analysis">
                    <p className="sensorimotor-description">
                      Sensorimotor features of words in your text:
                    </p>
                    <div className="sensorimotor-items">
                      {Object.entries(sensorimotor)
                        .slice(0, 10)
                        .map(([word, norms]) => (
                          norms && (
                            <div key={word} className="sensorimotor-item">
                              <h4 className="norms-word">{word}</h4>
                              <div className="norms-details">
                                {Object.entries(norms)
                                  .slice(1, 6)
                                  .map(([key, value]) => (
                                    <div key={key} className="norm-item">
                                      <span className="norm-label">
                                        {key.replace(/_/g, ' ')}:
                                      </span>
                                      <span className="norm-value">
                                        {typeof value === 'number'
                                          ? value.toFixed(2)
                                          : value}
                                      </span>
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

        {/* 🧩 Modal for Keyness Chart */}
        <Modal
          open={openModal === 'keyness'}
          title="Keyness Chart"
          onClose={() => setOpenModal(null)}
          fullscreen
        >
          {keynessImage ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={keynessImage}
                alt="Keyness Chart"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 12,
                }}
              />
            </div>
          ) : (
            <p>No keyness chart available</p>
          )}
        </Modal>
        {/* 🧩 Modal for Semantic Clustering */}
        <Modal
          open={openModal === 'cluster'}
          title="Semantic Clustering Visualization"
          onClose={() => setOpenModal(null)}
        >
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
          ) : (
            <p>No clustering visualization available</p>
          )}
        </Modal>

        {/* 🧩 Modal for Sentiment Analysis */}
        <Modal
          open={openModal === 'sentiment'}
          title="Sentiment Analysis"
          onClose={() => setOpenModal(null)}
        >
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
        {/* 🧩 Modal for Sensorimotor Norms */}
        <Modal 
          open={openModal==='sensor'} 
          title="Sensorimotor Norms Analysis" 
          onClose={() => setOpenModal(null)}
        >
          {sensorimotorData ? (
            <div className="sensorimotor-analysis" style={{maxHeight:'70vh', overflow:'auto'}}>
              {/* if backend provided an image_base64, show it after the expanded data */}
              {sensorimotorData.image_base64 ? (
                <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={`data:image/png;base64,${sensorimotorData.image_base64}`}
                    alt="Sensorimotor summary"
                    style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}
                  />
                </div>
              ) : null}

              <div className="sensorimotor-items">
                {/* show expanded data (use sensorimotor variable for the word->norms map) */}
                {Object.entries(sensorimotor).map(([word, norms]) => (
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


function KeynessAnalysis({ setKeynessImage, setOpenModal }) {
  const [poemAFile, setPoemAFile] = useState(null);
  const [poemBFile, setPoemBFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const poemAFileRef = useRef(null);
  const poemAFolderRef = useRef(null);
  const poemBFileRef = useRef(null);
  const poemBFolderRef = useRef(null);

  //combine .txt files into a single file
  const combineTextFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return ext === '.txt';
    });
    if (files.length === 0) return null;
    const texts = await Promise.all(files.map(f => f.text()));
    const combined = texts.join('\n\n');
    const blob = new Blob([combined], { type: 'text/plain' });
    const pseudo = new File([blob], 'batch_combined.txt', { type: 'text/plain' });
    return pseudo;
  };

  //folder input helpers
  const handlePoemAFolder = async (e) => {
    const pseudo = await combineTextFiles(e.target.files);
    if (pseudo) {
      setPoemAFile(pseudo);
      setError('');
      if (poemAFileRef.current) poemAFileRef.current.value = ''; //reset file input when other is used
    } else {
      setError('No .txt files found in selected Poem A folder');
    }
  };
  const handlePoemBFolder = async (e) => {
    const pseudo = await combineTextFiles(e.target.files);
    if (pseudo) {
      setPoemBFile(pseudo);
      setError('');
      if (poemBFileRef.current) poemBFileRef.current.value = ''; //reset file input when other is used
    } else {
      setError('No .txt files found in selected Poem B folder');
    }
  };

  const handleSubmit = async () => {
    if (!poemAFile || !poemBFile) {
      setError('Please upload both Poem A and Poem B files (or folders) before running analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('poemA', poemAFile);
    formData.append('poemB', poemBFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/keyness', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Backend error:', data);
        setError(data.error || 'Failed to generate keyness plot.');
        return;
      }

      if (data.image) {
        const img = `data:image/png;base64,${data.image}`;
        setImageSrc(img);
        setKeynessImage(img);
        console.log('✅ Keyness image received successfully.');
      } else {
        setError('No image returned from backend.');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Error connecting to backend. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="keyness-section">
      <div className="file-upload">
        <label className="file-label">Upload Poem A (file):</label>
        <input
          ref={poemAFileRef}
          type="file"
          accept=".txt,.docx,.doc"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setPoemAFile(e.target.files[0]);
              setError('');
              if (poemAFolderRef.current) poemAFolderRef.current.value = ''; //reset folder input when other is used
            }
          }}
        />
      </div>

      <div className="file-upload">
        <label className="file-label">Upload Poem A (folder):</label>
        <input
          ref={poemAFolderRef}
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handlePoemAFolder}
        />
      </div>

      <div className="file-upload">
        <label className="file-label">Upload Poem B (file):</label>
        <input
          type="file"
          accept=".txt,.docx,.doc"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setPoemBFile(e.target.files[0]);
              setError('');
              if (poemBFolderRef.current) poemBFolderRef.current.value = ''; //reset folder input when other is used
            }
          }}
        />
      </div>

      <div className="file-upload">
        <label className="file-label">Upload Poem B (folder):</label>
        <input
          ref={poemBFolderRef}
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handlePoemBFolder}
        />
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Running Analysis...' : 'Run Keyness Analysis'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {imageSrc && (
        <div className="chart-container" onClick={() => setOpenModal('keyness')} style={{ cursor: 'zoom-in', marginTop: '15px' }}>
          <img src={imageSrc} alt="Keyness Chart" />
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
