import './assets/ResultsPage.css';
import { useState, useRef } from 'react';
import Modal from './Modal';
import Plot from 'react-plotly.js';
import { useEffect } from 'react';
import { eng as STOPWORD_LIST } from 'stopword';

function ResultsPage({ results, onBack }) {
  const [openModal, setOpenModal] = useState(null);
  const [sentimentView, setSentimentView] = useState('positive');
  const [sentimentOrder, setSentimentOrder] = useState('desc');
  const [keynessImage, setKeynessImage] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [keynessChoiceOpen, setKeynessChoiceOpen] = useState(false);
  const [loadInteractive, setLoadInteractive] = useState(false);
  const [interactiveLoading, setInteractiveLoading] = useState(false);
  const [interactiveError, setInteractiveError] = useState(null);
  const [interactiveReloadCounter, setInteractiveReloadCounter] = useState(0);

  const sentimentData = results.ratings;
  const clusterData = results.cluster;
  const sensorimotorData = results.sensorimotor;

  //safety
  const sensorimotor = sensorimotorData && sensorimotorData.data ? sensorimotorData.data : sensorimotorData;

  // At top of ResultsPage component, find the text (sample: from clusterData or results)
  const userText = results?.text || results?.raw_text || null;

  // Reset interactive state when modal closes or changes
  useEffect(() => {
    if (openModal !== 'cluster') {
      setLoadInteractive(false);
      setInteractiveLoading(false);
      setInteractiveError(null);
      setInteractiveReloadCounter(0);
    }
  }, [openModal]);

  if (!results) return <p>No results received.</p>;

  return (
    <div className="results-container">
      <div className="results-content">
        <h1 className="results-title">Analysis Results</h1>
        <h3 className="results-subtitle">Click on panels to view more information</h3>

        <div className="results-grid">
          {/* 🔁 Word Frequency Panel */}
          <div
            className="results-panel"
            onClick={() => setOpenModal('frequency')}
            style={{ cursor: 'zoom-in' }}
          >
            <h2 className="panel-title">Word Frequency Analysis</h2>
            <div className="panel-content" style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setKeynessChoiceOpen(true); }}
                title="Open Keyness (A vs B)"
                aria-label="Open Keyness"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  padding: '6px 10px',
                  background: '#ffffff',
                  color: '#333',
                  fontWeight: 600,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  cursor: 'pointer'
                }}
              >
                Keyness
              </button>
              <div className="placeholder-content">
                <WordFrequencyPreview
                  text={userText}
                  onData={setFrequencyData}
                />
              </div>
            </div>
          </div>

          {/* (Removed) Keyness Statistics Panel */}

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
        {/* 🧩 Modal for Keyness choice (File vs Folder for Poem B) */}
        <Modal
          open={keynessChoiceOpen}
          title="Keyness: Choose Poem B Source"
          onClose={() => setKeynessChoiceOpen(false)}
        >
          <KeynessChooser
            userText={userText}
            onImage={(img) => { setKeynessImage(img); setOpenModal('keyness'); setKeynessChoiceOpen(false); }}
          />
        </Modal>
        {/* 🧩 Modal for Word Frequency */}
        <Modal
          open={openModal === 'frequency'}
          title="Word Frequency"
          onClose={() => setOpenModal(null)}
          fullscreen
        >
          {frequencyData ? (
            <div style={{width:'100%', height:'100%'}}>
              <Plot
                data={[{
                  type: 'bar',
                  x: frequencyData.words,
                  y: frequencyData.freqs,
                  marker: { color: '#4f46e5' }
                }]}
                layout={{
                  title: 'Top Word Relative Frequencies',
                  xaxis: { title: 'Word' },
                  yaxis: { title: 'Proportion', rangemode: 'tozero' },
                  margin: { l: 60, r: 20, t: 50, b: 120 },
                }}
                config={{ responsive: true }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <p>No word frequency data available</p>
          )}
        </Modal>
        {/* 🧩 Modal for Semantic Clustering */}
        <Modal
          open={openModal === 'cluster'}
          title="Semantic Clustering Visualization"
          onClose={() => setOpenModal(null)}
        >
          {openModal === 'cluster' && (
            <div style={{position:'relative', width:'100%', height:'100%'}}>
              {userText && loadInteractive ? (
                <ClusterPlot
                  text={userText}
                  refreshToken={interactiveReloadCounter}
                  onLoadingChange={setInteractiveLoading}
                  onError={setInteractiveError}
                  fallbackImage={clusterData && (clusterData.labeled || clusterData.plot || clusterData.simple) ? `data:image/png;base64,${clusterData.labeled || clusterData.plot || clusterData.simple}` : null}
                />
              ) : clusterData && (clusterData.labeled || clusterData.plot) ? (
                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <img
                    src={`data:image/png;base64,${clusterData.labeled || clusterData.plot}`}
                    alt="Word clustering visualization"
                    style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:12, display:'block'}}
                  />
                </div>
              ) : (
                <p>No clustering visualization available</p>
              )}
              {userText && (
                (!loadInteractive || interactiveLoading || interactiveError) && (
                  <button
                    onClick={() => {
                      if (!loadInteractive) {
                        setLoadInteractive(true);
                        setInteractiveLoading(true);
                        setInteractiveError(null);
                      } else if (interactiveError) {
                        setInteractiveLoading(true);
                        setInteractiveError(null);
                        setInteractiveReloadCounter(c => c + 1);
                      }
                    }}
                    style={{
                      position:'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      padding: '6px 12px',
                      background:'#ffffff',
                      color:'#333',
                      fontWeight: 600,
                      border:'1px solid #ccc',
                      borderRadius: 6,
                      boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
                      cursor: interactiveLoading ? 'default' : 'pointer',
                      opacity: interactiveLoading ? 0.7 : 1
                    }}
                    title={interactiveLoading ? 'Loading graph...' : (interactiveError ? 'Retry interactive graph' : 'Load interactive graph')}
                    aria-label={interactiveLoading ? 'Loading graph' : (interactiveError ? 'Retry interactive graph' : 'Load interactive graph')}
                    disabled={interactiveLoading}
                  >
                    {interactiveLoading ? 'Loading graph...' : (interactiveError ? 'Retry interactive' : 'Load interactive graph')}
                  </button>
                )
              )}
            </div>
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

function WordFrequencyPreview({ text, onData }) {
  const [topWords, setTopWords] = useState([]);

  const STOPWORDS = new Set(STOPWORD_LIST);

  useEffect(() => {
    if (!text) {
      setTopWords([]);
      if (onData) onData(null);
      return;
    }

    // basic tokenisation
    const rawTokens = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    // remove stopwords + very short tokens
    const tokens = rawTokens.filter(
      (w) => !STOPWORDS.has(w) && w.length > 2
    );

    if (tokens.length === 0) {
      setTopWords([]);
      if (onData) onData(null);
      return;
    }

    const total = tokens.length;
    const counts = new Map();

    for (const w of tokens) {
      counts.set(w, (counts.get(w) || 0) + 1);
    }

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

    const preview = sorted.slice(0, 15).map(([w, c]) => [w, c / total]);
    setTopWords(preview);

    if (onData) {
      const top50 = sorted.slice(0, 50);
      onData({
        words: top50.map(([w]) => w),
        freqs: top50.map(([, c]) => c / total),
        total
      });
    }
  }, [text]);

  return (
    <div className="sentiment-analysis">
      <p className="sentiment-description">
        Most frequent content words in your text:
      </p>
      <ul className="sentiment-items">
        {topWords.map(([word, freq]) => (
          <li key={word} className="sentiment-item">
            <span className="word">{word}</span>
            <span className="sentiment-score neutral">
              {freq.toFixed(3)}
            </span>
          </li>
        ))}
      </ul>
      {(!topWords || topWords.length === 0) && <p>No frequency data found</p>}
    </div>
  );
}


function ClusterPlot({ text, fallbackImage, onLoadingChange, onError, refreshToken }) {
  const [points, setPoints] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!text) return;
    setLoading(true);
    setError(null);
    if (onLoadingChange) onLoadingChange(true);
    if (onError) onError(null);
    fetch('http://127.0.0.1:8000/cluster-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setPoints(data.points || []);
        setSummaries(data.summaries || []);
      })
      .catch((e) => {
        setError(e.message);
        if (onError) onError(e.message);
      })
      .finally(() => {
        setLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      });
  }, [text, refreshToken]);

  // While loading, show the static fallback image if provided
  if (loading && fallbackImage) {
    return (
      <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <img
          src={fallbackImage}
          alt="Word clustering (loading interactive view)"
          style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:12, display:'block'}}
        />
      </div>
    );
  }

  if (error && fallbackImage) {
    return (
      <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
        <img
          src={fallbackImage}
          alt="Word clustering (interactive failed)"
          style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:12, display:'block'}}
        />
        <p style={{marginTop:8, color:'#b00'}}>Interactive view failed: {error}</p>
      </div>
    );
  }

  if (!points.length) {
    return fallbackImage ? (
      <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <img
          src={fallbackImage}
          alt="Word clustering"
          style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:12, display:'block'}}
        />
      </div>
    ) : <p>No clustering data.</p>;
  }

  // Helper to strip any leading "Cluster n:" prefix (handles spaces/unicode and case)
  const stripClusterPrefix = (txt) => {
    if (!txt || typeof txt !== 'string') return '';
    const cleaned = txt.replace(/^[\s\u00A0]*Cluster\s+\d+\s*:\s*/i, '');
    if (cleaned !== txt) return cleaned;
    const idx = txt.indexOf(':');
    return idx >= 0 ? txt.slice(idx + 1).trim() : txt;
  };

  // Unique clusters for sidebar ordering and color mapping
  const uniqueClusters = Array.from(new Set(points.map(p => p.cluster_label)));

  // Use a categorical color palette for clusters (use Plotly's safe palette)
  const CATEGORY_COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94',
    '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
  ];
  const clusterLabelToColor = (label) => CATEGORY_COLORS[label % CATEGORY_COLORS.length];

  // Position summaries evenly vertically on the right side (x=1.06, y from 0.95 to 0)
  const annotations = summaries.map((s, i) => ({
    text: `<b>Cluster ${s.cluster_label}</b>: ${stripClusterPrefix(s.summary)}`,
    xref: 'paper',
    yref: 'paper',
    x: 1.06,
    xanchor: 'left',
    y: 0.95 - (i / Math.max(1, summaries.length-1)) * 0.9,
    yanchor: 'middle',
    align: 'left',
    showarrow: false,
    font: {size: 13, color: clusterLabelToColor(s.cluster_label)},
    borderpad: 4,
    bgcolor: 'rgba(255,255,255,0.93)',
    bordercolor: '#bbb',
    borderwidth: 1,
  }));

  // Build hover entities per cluster from summaries
  const clusterEntitiesByLabel = summaries.reduce((acc, s) => {
    acc[s.cluster_label] = stripClusterPrefix(s.summary);
    return acc;
  }, {});

  return (
    <Plot
      data={[{
        x: points.map(p => p.x),
        y: points.map(p => p.y),
        marker: {
          size: 12,
          color: points.map(p => clusterLabelToColor(p.cluster_label)),
          opacity: 0.92
        },
        mode: 'markers+text',
        type: 'scatter',
        text: points.map(p => p.word),
        textposition: 'top center',
        hovertext: points.map(p => `Cluster ${p.cluster_label}: ${clusterEntitiesByLabel[p.cluster_label] || ''}`),
        hoverinfo: 'text',
        hovertemplate: '%{hovertext}<extra></extra>',
      }]}
      layout={{
        title: 'Semantic Cluster Graph',
        xaxis: { title: 'TSNE-1', zeroline: false, showgrid: false },
        yaxis: { title: 'TSNE-2', zeroline: false, showgrid: false },
        hovermode: 'closest',
        margin: { l: 40, r: 220, t: 40, b: 50 },
        plot_bgcolor: '#fafafc', paper_bgcolor: '#fff',
        annotations,
      }}
      config={{ responsive: true }}
      style={{ width: '100%', height: '520px' }}
    />
  );
}

function KeynessChooser({ userText, onImage }) {
  const [bFile, setBFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const folderRef = useRef(null);

  const combineTextFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => ('.' + f.name.split('.').pop().toLowerCase()) === '.txt');
    if (!files.length) return null;
    const texts = await Promise.all(files.map(f => f.text()));
    return new File([new Blob([texts.join('\n\n')], { type: 'text/plain' })], 'batch_combined.txt', { type: 'text/plain' });
  };

  const runKeyness = async (aTextFile, bTextFile) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('poemA', aTextFile);
      formData.append('poemB', bTextFile);
      const response = await fetch('http://127.0.0.1:8000/keyness', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate keyness plot');
      if (data.image && onImage) onImage(`data:image/png;base64,${data.image}`);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const buildATextFile = () => {
    const text = typeof userText === 'string' ? userText : '';
    return new File([new Blob([text], { type: 'text/plain' })], 'analysed_text.txt', { type: 'text/plain' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0 }}>Select Poem B to compare against your analysed text.</p>
      {/* Hidden inputs */}
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.docx,.doc"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          if (f) { setBFile(f); setError(null); }
        }}
      />
      <input
        ref={folderRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        style={{ display: 'none' }}
        onChange={async (e) => {
          const pseudo = await combineTextFiles(e.target.files);
          if (pseudo) { setBFile(pseudo); setError(null); }
          else { setError('No .txt files found in selected folder'); }
        }}
      />
      {/* Visible actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
        <button
          className="next-button"
          onClick={() => fileRef.current && fileRef.current.click()}
        >
          Upload File
        </button>
        <button
          className="next-button"
          onClick={() => folderRef.current && folderRef.current.click()}
        >
          Upload Folder
        </button>
      </div>
      <button
        className="next-button"
        disabled={loading || !bFile || !userText}
        onClick={() => runKeyness(buildATextFile(), bFile)}
      >
        {loading ? 'Running Analysis...' : 'Run Keyness Analysis'}
      </button>
      {error && <p style={{ color: '#b00', marginTop: 6 }}>{error}</p>}
    </div>
  );
}

export default ResultsPage;
