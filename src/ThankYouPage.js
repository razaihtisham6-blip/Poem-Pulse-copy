import './ThankYouPage.css';
import { useEffect } from 'react';
import thankYouImage from '../assets/Poem-Pulse 2.png';

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
              <img src={thankYouImage} alt="Poem-Pulse" className="logo-svg" />
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
