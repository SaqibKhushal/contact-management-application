import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const features = [
    "Organize Your Contacts",
    "Search & Filter Easily",
    "Manage Multiple Emails",
    "Track Phone Numbers",
    "Secure & Private",
    "Access Anywhere"
  ];

  useEffect(() => {
    const typingSpeed = 100;
    const deletingSpeed = 60;
    const pauseAfterTyping = 1500;
    const pauseAfterDeleting = 500;

    const currentText = features[currentFeature];

    const typeEffect = () => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseAfterTyping);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setCurrentFeature((currentFeature + 1) % features.length);
          setTimeout(() => {}, pauseAfterDeleting);
        }
      }
    };

    const timer = setTimeout(typeEffect, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, currentFeature]);

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Header Box */}
        <div className="header-box">
          <h1 className="main-heading">Contact Management</h1>
        </div>

        {/* Typing Animation */}
        <div className="typing-section">
          <div className="typing-box">
            <span className="typed-text">{displayText}</span>
            <span className="cursor"></span>
          </div>
        </div>

        {/* Contact Folder Animation */}
        <div className="folder-container">
          <div className="folder-box">
            <div className="folder-icon">
              <div className="folder-tab"></div>
              <div className="folder-body">
                <div className="contact-cards">
                  <div className="contact-card card-1">
                    <div className="card-avatar">👤</div>
                  </div>
                  <div className="contact-card card-2">
                    <div className="card-avatar">👥</div>
                  </div>
                  <div className="contact-card card-3">
                    <div className="card-avatar">📇</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Button */}
        <button className="view-button" onClick={() => navigate('/contacts')}>
          View
        </button>
      </div>
    </div>
  );
};

export default HomePage;