import './ExitPage.css';

function ExitPage({ onUploadAnother, onExit }) {
  return (
    <div className="exit-container">
      <div className="exit-content">
        <button className="download-button" onClick={() => console.log('Download results clicked')}>
          Download Results
        </button>
        
        <p className="deletion-message">Your File Has been Deleted</p>
      </div>
      
      <div className="exit-footer">
        <div className="footer-line"></div>
        <div className="footer-links">
          <button className="upload-another-link" onClick={onUploadAnother}>
            Upload Another Text
          </button>
          <button className="exit-link" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExitPage;
