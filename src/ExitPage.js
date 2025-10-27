// ExitPage.js
import './assets/ExitPage.css';
// ADDED: jsPDF for embedding the cluster image into the PDF
import jsPDF from 'jspdf';

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
    
    else if (format === 'png') {
      const plotB64 = results?.cluster?.plot || '';
      if (!plotB64) return;
      const href = plotB64.startsWith('data:image') ? plotB64 : `data:image/png;base64,${plotB64}`;
      const link = document.createElement('a');
      link.href = href;
      link.download = `poem-pulse-clusters-${timestamp}.png`;
      link.click();
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
      // CHANGED: generate a PDF with jsPDF and embed the base64 plot image
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      // Title
      doc.setFontSize(18);
      doc.text('POEM PULSE ANALYSIS RESULTS', margin, y);
      y += 24;

      // Generated date
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
      y += 20;

      // Summary
      doc.setFontSize(14);
      doc.text('SUMMARY', margin, y); y += 16;
      doc.setFontSize(11);
      const summary = generateSummaryText();
      const wrappedSummary = doc.splitTextToSize(summary, pageW - margin * 2);
      doc.text(wrappedSummary, margin, y);
      y += wrappedSummary.length * 14 + 8;

      // Semantic Clustering Visualization (image)
      doc.setFontSize(14);
      doc.text('SEMANTIC CLUSTERING VISUALIZATION', margin, y); y += 12;

      const plotB64 = results?.cluster?.plot || '';
      const imgData = plotB64.startsWith('data:image')
        ? plotB64
        : (plotB64 ? `data:image/png;base64,${plotB64}` : '');

      if (imgData) {
        try {
          const { width, height } = doc.getImageProperties(imgData);
          const targetW = pageW - margin * 2;
          const targetH = (height * targetW) / width;

          // page break if needed
          if (y + targetH > pageH - margin) { doc.addPage(); y = margin; }

          doc.addImage(imgData, 'PNG', margin, y, targetW, targetH, undefined, 'FAST');
          y += targetH + 14;
        } catch (e) {
          doc.setFontSize(11);
          doc.text('(plot unavailable)', margin, y); y += 14;
        }
      } else {
        doc.setFontSize(11);
        doc.text('(plot unavailable)', margin, y); y += 14;
      }

      // Word Frequency (top 20)
      if (results.relative_frequency) {
        if (y > pageH - margin - 160) { doc.addPage(); y = margin; }
        doc.setFontSize(14);
        doc.text('WORD FREQUENCY ANALYSIS (Top 20)', margin, y); y += 14;
        doc.setFontSize(11);
        const lines = Object.entries(results.relative_frequency)
          .slice(0, 20)
          .map(([w, f]) => `${w}: ${(f * 100).toFixed(2)}%`);
        const wrapped = doc.splitTextToSize(lines.join('\n'), pageW - margin * 2);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 12 + 8;
      }

      // Sentiment
      if (results.ratings) {
        if (y > pageH - margin - 180) { doc.addPage(); y = margin; }
        doc.setFontSize(14);
        doc.text('SENTIMENT ANALYSIS', margin, y); y += 14;
        doc.setFontSize(11);
        const valid = Object.entries(results.ratings).filter(([_, s]) => s !== null);
        if (valid.length) {
          const avg = valid.reduce((sum, [_, s]) => sum + s, 0) / valid.length;
          const overall = avg > 0 ? 'Positive' : avg < 0 ? 'Negative' : 'Neutral';
          doc.text(`Overall Sentiment: ${overall}`, margin, y); y += 14;
          const items = valid.slice(0, 15).map(([w, s]) => `${w}: ${s.toFixed(3)}`);
          const block = doc.splitTextToSize(items.join('\n'), pageW - margin * 2);
          doc.text(block, margin, y);
          y += block.length * 12 + 8;
        } else {
          doc.text('(no sentiment values)', margin, y); y += 14;
        }
      }

      // Sensorimotor
      if (results.sensorimotor) {
        if (y > pageH - margin - 220) { doc.addPage(); y = margin; }
        doc.setFontSize(14);
        doc.text('SENSORIMOTOR ANALYSIS', margin, y); y += 14;
        doc.setFontSize(11);
        const topWords = Object.entries(results.sensorimotor).slice(0, 3);
        if (topWords.length === 0) {
          doc.text('(no sensorimotor values)', margin, y); y += 14;
        } else {
          for (const [word, norms] of topWords) {
            if (!norms) continue;
            if (y > pageH - margin - 120) { doc.addPage(); y = margin; }
            doc.text(word, margin, y); y += 12;
            const subset = Object.entries(norms).slice(1, 6)
              .map(([k, v]) => `• ${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? v.toFixed(2) : v}`);
            const block = doc.splitTextToSize(subset.join('\n'), pageW - margin * 2);
            doc.text(block, margin + 14, y);
            y += block.length * 12 + 8;
          }
        }
      }

      doc.save(`poem-pulse-analysis-${timestamp}.pdf`);
    }
  };

  return (
    <div className="exit-container">
      <div className="exit-content">
        <div className="reading-summary">
          <p className="reading-line">Your writing shows</p>
          <p className="reading-line highlight">Strong {results.sensorimotor.max_perceptual} and  {results.sensorimotor.max_action} themes</p>
          <p className="reading-line">You might want to explore expanding</p>
          <p className="reading-line highlight">Sensory portrayal of {results.sensorimotor.weakness} in your work</p>
        </div>
        
        <div className="download-options">
          <button className="download-results-btn" onClick={() => downloadResults('pdf')}>
            Download PDF Report
          </button>
          <button className="download-results-btn" onClick={() => downloadResults('png')}>
            Download PNG (Cluster)
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
          <button className="action-button danger" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExitPage;
