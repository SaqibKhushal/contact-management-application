import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import contactService from '../services/contactService';
import LoadingSpinner from '../components/LoadingSpinner';
import './ContactList.css';

const ContactList = () => {
  const [loading, setLoading] = useState(true);
  const [contactCount, setContactCount] = useState(0);
  const navigate = useNavigate();

  // Features for typing animation - memoized to prevent re-creation
  const features = useMemo(() => [
    "Manage Your Contacts",
    "Organize Efficiently",
    "Search Quickly",
    "Stay Connected",
    "Professional Management",
    "Secure & Private"
  ], []);

  const fetchContactCount = useCallback(async () => {
    setLoading(true);
    try {
      const response = await contactService.getAllContacts(0, 1);
      setContactCount(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch contact count:', error);
      setContactCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const startTypingAnimation = useCallback(() => {
    const textElement = document.getElementById("typewriter");
    if (!textElement) return;

    let skillIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typingSpeed = 100;
    const deletingSpeed = 60;
    const pauseAfterTyping = 1200;
    const pauseAfterDeleting = 400;

    function typeEffect() {
      const currentText = features[skillIndex];

      if (isDeleting) {
        textElement.textContent = currentText.slice(0, charIndex--);

        if (charIndex === 0) {
          isDeleting = false;
          skillIndex = (skillIndex + 1) % features.length;
          setTimeout(typeEffect, pauseAfterDeleting);
        } else {
          setTimeout(typeEffect, deletingSpeed);
        }
      } else {
        textElement.textContent = currentText.slice(0, charIndex++);
        
        if (charIndex === currentText.length + 1) {
          setTimeout(() => isDeleting = true, pauseAfterTyping);
        }
        setTimeout(typeEffect, typingSpeed);
      }
          skillIndex = (skillIndex + 1) % features.length;
          setTimeout(() => {}, pauseAfterDeleting);
        }
      }

      const delay = isDeleting ? deletingSpeed : typingSpeed;
      setTimeout(typeEffect, delay);
    }

    typeEffect();
  }, [features]);

  useEffect(() => {
    fetchContactCount();
    startTypingAnimation();
  }, [fetchContactCount, startTypingAnimation]);

  const handleViewAllContacts = () => {
    navigate('/all-contacts');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="modern-dashboard-container">
      <div className="modern-dashboard-card">
        {/* Heading */}
        <h1 className="dashboard-title">Contact Management Application</h1>

        {/* Typing Animation */}
        <div className="typing-container">
          <div className="typing-box">
            <span id="typewriter" className="typing-text"></span>
            <span className="typing-cursor"></span>
          </div>
        </div>

        {/* Folder Icon with Overlapping Images */}
        <div className="folder-section">
          <div className="folder-icon-wrapper">
            {/* Overlapping Contact Icons */}
            <div className="overlapping-icons">
              <div className="icon-circle icon-1">👤</div>
              <div className="icon-circle icon-2">👥</div>
              <div className="icon-circle icon-3">📇</div>
            </div>
            
            {/* Main Folder Icon */}
            <div className="folder-icon">
              <svg viewBox="0 0 200 160" className="folder-svg">
                {/* Folder Back */}
                <path d="M10,40 L10,140 Q10,150 20,150 L180,150 Q190,150 190,140 L190,40 Z" 
                      fill="#f8f9fa" 
                      stroke="#dee2e6" 
                      strokeWidth="2"/>
                
                {/* Folder Tab */}
                <path d="M10,40 L10,30 Q10,20 20,20 L70,20 L80,40 Z" 
                      fill="#e9ecef" 
                      stroke="#dee2e6" 
                      strokeWidth="2"/>
                
                {/* Folder Front */}
                <path d="M10,40 L80,40 L90,50 Q95,55 100,55 L180,55 Q190,55 190,65 L190,140 Q190,150 180,150 L20,150 Q10,150 10,140 Z" 
                      fill="#ffffff" 
                      stroke="#dee2e6" 
                      strokeWidth="2"/>
                
                {/* Contact Count Badge */}
                <circle cx="170" cy="70" r="15" fill="#7c3aed" stroke="white" strokeWidth="2"/>
                <text x="170" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  {contactCount}
                </text>
              </svg>

              {/* Hover Text */}
              <div className="folder-label">
                {contactCount} {contactCount === 1 ? 'Contact' : 'Contacts'}
              </div>
            </div>
          </div>
        </div>

        {/* View All Contacts Button */}
        <button className="view-all-btn" onClick={handleViewAllContacts}>
          View All Contacts
        </button>
      </div>
    </div>
  );
};

export default ContactList;