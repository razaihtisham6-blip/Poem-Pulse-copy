import './ThankYouPage.css';
import { useEffect } from 'react';
import logoImage from './logo.png';

function ThankYouPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="thankyou-container">
      <div className="thankyou-content">
        <h1 className="thankyou-message">Thank you for using our services</h1>
        
        <div className="logo-container">
          <img src={logoImage} alt="POEM-PULSE Logo" className="logo-image" />
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;
