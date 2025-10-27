import './assets/Modal.css';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, title, onClose, children, fullscreen = false }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    (
      <div className="modal-backdrop" onClick={onClose}>
        <div className={`modal-content${fullscreen ? ' fullscreen' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className={`modal-body${fullscreen ? ' fullscreen-body' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    ),
    document.body
  );
}

export default Modal;


