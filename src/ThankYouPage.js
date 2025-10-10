import './ThankYouPage.css';
import { useEffect } from 'react';
import thankYouImage from './Poem-Pulse 2.png';

function ThankYouPage({ onComplete }) {
  const shutdownServer = async () => {
    try {
      // Call the backend shutdown endpoint
      await fetch('http://127.0.0.1:3001/api/shutdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Backend shutdown request sent');
    } catch (error) {
      console.log('Backend may already be stopped:', error.message);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Shutdown backend server
      await shutdownServer();
      
      // Close the application window
      window.close();
      
      // If window.close() doesn't work (some browsers block it), try other methods
      setTimeout(() => {
        if (!window.closed) {
          // Try to navigate away or show a message
          document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h2>Thank you for using Poem-Pulse!</h2><p>You can now close this window.</p></div>';
        }
      }, 2000);
      
      // Call the original onComplete if provided
      if (onComplete) {
        onComplete();
      }
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
