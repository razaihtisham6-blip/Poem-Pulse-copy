import './ExitPage.css';

function ExitPage({ results, onUploadAnother, onExit }) {
  const generateSummaryText = () => {
    if (!results) return "No analysis available";
    
    const totalSentiment = results.ratings ? 
      Object.values(results.ratings).reduce((sum, score) => sum + (score || 0), 0) / Object.keys(results.ratings).length : 0;
    const sentimentClass = totalSentiment > 0 ? 'positive' : totalSentiment < 0 ? 'negative' : 'neutral';
    const sentimentText = sentimentClass.charAt(0).toUpperCase() + sentimentClass.slice(1);
    
    return `Your writing shows ${sentimentText.toLowerCase()} themes with a sentiment score of ${totalSentiment.toFixed(3)}.`;
  };

  const downloadResults = (format) => {
    if (!results) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'json') {
      const dataStr = JSON.stringify(results, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poem-pulse-analysis-${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
    
    else if (format === 'txt') {
      let content = `POEM PULSE ANALYSIS RESULTS\n`;
      content += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
      
      content += `SUMMARY:\n`;
      content += `${generateSummaryText()}\n\n`;
      
      if (results.relative_frequency) {
        content += `WORD FREQUENCY ANALYSIS:\n`;
        Object.entries(results.relative_frequency).slice(0, 20).forEach(([word, freq]) => {
          content += `${word}: ${(freq * 100).toFixed(2)}%\n`;
        });
        content += `\n`;
      }
      
      if (results.ratings) {
        content += `SENTIMENT ANALYSIS:\n`;
        const validSentiments = Object.entries(results.ratings).filter(([word, score]) => score !== null);
        const avgSentiment = validSentiments.reduce((sum, [_, score]) => sum + score, 0) / validSentiments.length;
        content += `Overall Sentiment: ${avgSentiment > 0 ? 'Positive' : avgSentiment < 0 ? 'Negative' : 'Neutral'}\n`;
        content += `Average Score: ${avgSentiment.toFixed(3)}\n\n`;
        
        content += `Individual Word Sentiments:\n`;
        validSentiments.slice(0, 15).forEach(([word, score]) => {
          content += `${word}: ${score.toFixed(3)}\n`;
        });
        content += `\n`;
      }
      
      if (results.sensorimotor) {
        content += `SENSORIMOTOR ANALYSIS:\n`;
        Object.entries(results.sensorimotor).slice(0, 5).forEach(([word, norms]) => {
          if (norms) {
            content += `${word}:\n`;
            Object.entries(norms).slice(1, 6).forEach(([key, value]) => {
              content += `  ${key.replace(/_/g, ' ')}: ${typeof value === 'number' ? value.toFixed(2) : value}\n`;
            });
            content += `\n`;
          }
        });
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poem-pulse-analysis-${timestamp}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
    
    else if (format === 'pdf') {
      // For PDF generation, we'll use a simple approach
      const printWindow = window.open('', '_blank');
      const content = `
        <html>
          <head><title>Poem Pulse Analysis</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>POEM PULSE ANALYSIS RESULTS</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h2>SUMMARY</h2>
            <p>${generateSummaryText()}</p>
            
            ${results.relative_frequency ? `
            <h2>WORD FREQUENCY ANALYSIS</h2>
            <ul>
              ${Object.entries(results.relative_frequency).slice(0, 20).map(([word, freq]) => 
                `<li><strong>${word}:</strong> ${(freq * 100).toFixed(2)}%</li>`
              ).join('')}
            </ul>
            ` : ''}
            
            ${results.ratings ? `
            <h2>SENTIMENT ANALYSIS</h2>
            <p><strong>Overall Sentiment:</strong> ${Object.values(results.ratings).reduce((sum, score) => sum + (score || 0), 0) / Object.keys(results.ratings).length > 0 ? 'Positive' : 'Negative'}</p>
            <ul>
              ${Object.entries(results.ratings).filter(([word, score]) => score !== null).slice(0, 15).map(([word, score]) => 
                `<li><strong>${word}:</strong> ${score.toFixed(3)}</li>`
              ).join('')}
            </ul>
            ` : ''}
            
            ${results.sensorimotor ? `
            <h2>SENSORIMOTOR ANALYSIS</h2>
            ${Object.entries(results.sensorimotor).slice(0, 3).map(([word, norms]) => 
              norms ? `<h3>${word}</h3><ul>${Object.entries(norms).slice(1, 6).map(([key, value]) => 
                `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${typeof value === 'number' ? value.toFixed(2) : value}</li>`
              ).join('')}</ul>` : ''
            ).join('')}
            ` : ''}
          </body>
        </html>
      `;
      
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="exit-container">
      <div className="exit-content">
        <div className="reading-summary">
          <p className="reading-line">Your writing shows</p>
          <p className="reading-line highlight">strong visual themes</p>
          <p className="reading-line">You might want to explore expanding</p>
          <p className="reading-line highlight">sensory diversity in your work</p>
        </div>

        <div className="download-options">
          <button className="download-results-btn" onClick={() => downloadResults('pdf')}>
            Download PDF Report
          </button>
          <button className="download-results-btn" onClick={() => downloadResults('txt')}>
            Download Text Report
          </button>
          <button className="download-results-btn" onClick={() => downloadResults('json')}>
            Download Raw Data (JSON)
          </button>
        </div>

        <p className="deletion-message">Your File Has been Deleted</p>

        <div className="exit-actions">
          <button className="action-button upload-another" onClick={onUploadAnother}>
            Upload Another Text
          </button>
        </div>
        
        {/* Exit button positioned in bottom right corner */}
        <button className="exit-button" onClick={onExit}>
          Exit
        </button>
      </div>
    </div>
  );
}

export default ExitPage;
