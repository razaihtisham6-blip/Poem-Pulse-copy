import './ThankYouPage.css';
import logoImage from './logo.svg';
import { useEffect } from 'react';

function ThankYouPage({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="thank-you-container">
      <div className="thank-you-content">
        <div className="thank-you-message">
          <p className="thank-you-text">Thank you for using our services</p>
          
          <div className="logo-container">
            <div className="logo-wrapper">
              <svg width="80" height="80" viewBox="0 0 80 80" className="logo-svg">
                <rect width="80" height="80" fill="#333" rx="8"/>
                
                {/* Quill Pen */}
                <path d="M25 25 L35 20 L40 25 L35 30 Z" fill="white"/>
                <path d="M35 20 L35 25 L40 30 L35 35 Z" fill="white"/>
                
                {/* Open Book */}
                <path d="M20 45 L35 48 L50 45 L45 55 L35 52 L25 55 Z" fill="white" stroke="white" strokeWidth="1"/>
                
                {/* Book Pages */}
                <line x1="25" y1="48" x2="35" y2="50" stroke="#333" strokeWidth="0.5"/>
                <line x1="27" y1="50" x2="33" y2="52" stroke="#333" strokeWidth="0.5"/>
                
                {/* Stars */}
                <path d="M55 25 L57 30 L60 25 L55 28 Z" fill="white"/>
                <path d="M60 15 L62 20 L65 15 L60 18 Z" fill="white"/>
                <path d="M48 35 L50 40 L53 35 L48 38 Z" fill="white"/>
                
                {/* Star bursts */}
                <circle cx="65" cy="35" r="2" fill="white"/>
                <circle cx="58" cy="18" r="1.5" fill="white"/>
                <circle cx="52" cy="42" r="1" fill="white"/>
              </svg>
              
              <div className="brand-text">
                <h1 className="brand-name">POEM-PULSE</h1>
                <p className="tagline">'Tell me something I don't know'</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;
