import React, { useState, useEffect } from 'react';
import ContactForm from './components/ContactForm';
import Lightning from './components/Lightning';
import './App.css';

// Set this to true to show the error page instead of the normal site
const SHOW_ERROR_PAGE = true;

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileContact, setShowMobileContact] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;

    if (isUpSwipe && !showMobileContact) {
      setShowMobileContact(true);
    }
  };

  const closeMobileContact = () => {
    setShowMobileContact(false);
  };

  const openMobileContact = () => {
    setShowMobileContact(true);
  };

  // Close mobile contact on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showMobileContact) {
        closeMobileContact();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showMobileContact]);

  useEffect(() => {
    if (SHOW_ERROR_PAGE) {
      window.location.href = '/error.html';
    }
  }, []);

  return (
    <div
      className="App"
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
    >
      {/* Enhanced lightning background with mobile-optimized settings */}
      <div id="lightning-background">
        <Lightning 
          hue={175} 
          speed={1} 
          intensity={1} 
          size={1}
          xOffset={isMobile ? -0.5 : 0}
        />
      </div>

      <div className="main-container">
        <div className="left-section">
          <div className="domain-header">
            <h1 className="domain-title">ZENCIA.TECH</h1>
            <p className="domain-subtitle">Premium Tech Domain Available for Acquisition</p>
            <div className="domain-features">
              <span className="feature">Modern & Memorable</span>
              <span className="feature">Perfect for Tech Ventures</span>
              <span className="feature">Global Brand Potential</span>
            </div>
          </div>

          <div className="domain-description">
            <h2>About This Domain</h2>
            <p>
              ZENCIA.TECH combines "Zen" (representing simplicity and balance) with "CIA" (often associated with intelligence and systems),
              making it ideal for AI, cybersecurity, SaaS, or any innovative technology venture seeking a distinctive brand identity.
            </p>
          </div>
        </div>

        <div className="right-section">
          <div className="contact-intro">
            <h2>Own ZENCIA.TECH</h2>
            <p>This premium domain is available for serious buyers. Submit your inquiry below.</p>
          </div>
          <ContactForm />

          <div className="footer">
            <p>&copy; {new Date().getFullYear()} ZENCIA.TECH Domain Sale. All inquiries confidential.</p>
          </div>
        </div>
      </div>

      {/* Mobile Swipe Indicator */}
      {isMobile && !showMobileContact && (
        <div className="mobile-swipe-indicator" onClick={openMobileContact}>
          <div className="swipe-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </div>
          <div className="swipe-hint">Swipe up to inquire</div>
        </div>
      )}

      {/* Mobile Contact Overlay */}
      {isMobile && (
        <div className={`mobile-contact-overlay ${showMobileContact ? 'active' : ''}`}>
          <div className="mobile-contact-header">
            <h3 className="mobile-contact-title">Contact Us</h3>
            <button className="close-btn" onClick={closeMobileContact}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="mobile-contact-content">
            <div className="mobile-contact-intro">
              <h2>Own ZENCIA.TECH</h2>
              <p>This premium domain is available for serious buyers. Submit your inquiry below.</p>
            </div>
            <ContactForm onSuccess={closeMobileContact} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;