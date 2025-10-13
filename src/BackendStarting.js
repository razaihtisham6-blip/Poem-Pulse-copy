import './BackendStarting.css';

function BackendStarting({ message = 'Starting backend...', onCancel }) {
  return (
    <div className="backend-starting-container">
      <div className="backend-starting-content">
        <h1 className="backend-starting-title">{message}</h1>

        <div className="spinner-container">
          <div className="spinner">
            <div className="spinner-arc"></div>
          </div>
        </div>

        <p className="backend-starting-sub">Waiting for http://127.0.0.1:8000 ...</p>

        {onCancel && (
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default BackendStarting;


