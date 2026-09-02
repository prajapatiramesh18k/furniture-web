'use client';
import { useState, useEffect } from 'react';
import { handleTrackedPhoneClick } from '@/lib/analytics';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = sessionStorage.getItem('announcement-dismissed');
    if (dismissed) setVisible(false);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('announcement-dismissed', '1');
  };

  if (!mounted || !visible) return null;

  return (
    <div className="announcement-bar">
      <div className="announcement-bar-inner">
        <span className="announcement-bar-item">
          <i className="fas fa-hard-hat"></i> Now booking projects for 2026
        </span>
        <span className="announcement-bar-divider">|</span>
        <span className="announcement-bar-item">
          <i className="fas fa-map-marker-alt"></i> Free site visit in Mumbai, Navi Mumbai &amp; Thane
        </span>
        <span className="announcement-bar-divider">|</span>
        <a
          href="tel:+918318727813"
          className="announcement-bar-item announcement-bar-highlight"
          onClick={() =>
            handleTrackedPhoneClick({
              branch: 'mumbai',
              cta: 'announcement_bar_call',
              source: 'announcement_bar',
            })
          }
        >
          <i className="fas fa-phone"></i> Call: +91 83187 27813
        </a>
      </div>
      <button
        type="button"
        className="announcement-bar-close"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        &times;
      </button>
    </div>
  );
}
