import React from 'react';
import './ContactCard.css';

const ContactCard = ({ contact, onEdit, onDelete, onView }) => {
  const getInitials = () => {
    return `${contact.firstName?.charAt(0) || ''}${contact.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getTagColor = (tag) => {
    const colors = {
      family: '#22c55e',
      friend: '#3b82f6',
      work: '#8b5cf6',
      important: '#ef4444'
    };
    return colors[tag?.toLowerCase()] || '#71717a';
  };

  return (
    <div className="contact-card">
      <div className="contact-avatar">
        {contact.profileImage && contact.profileImage.trim() !== '' ? (
          <img 
            src={contact.profileImage} 
            alt={`${contact.firstName} ${contact.lastName}`} 
            className="contact-avatar-img" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.textContent = getInitials();
            }}
          />
        ) : (
          getInitials()
        )}
      </div>

      <div className="contact-info">
        <div className="contact-name-row">
          <h3 className="contact-name">
            {contact.firstName} {contact.lastName}
          </h3>
          {contact.tags && contact.tags.length > 0 && (
            <div className="contact-tags">
              {contact.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="tag-dot"
                  style={{ backgroundColor: getTagColor(tag) }}
                  title={tag}
                />
              ))}
            </div>
          )}
        </div>
        {contact.title && <p className="contact-title">{contact.title}</p>}

        <div className="contact-details">
          {contact.emailAddresses && contact.emailAddresses.length > 0 && (
            <div className="contact-detail">
              <span className="detail-icon">📧</span>
              <span className="detail-text">{contact.emailAddresses[0].email}</span>
            </div>
          )}

          {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
            <div className="contact-detail">
              <span className="detail-icon">📱</span>
              <span className="detail-text">{contact.phoneNumbers[0].phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="contact-actions">
        <button className="action-btn view-btn" onClick={() => onView(contact)} title="View">
          👁️
        </button>
        <button className="action-btn edit-btn" onClick={() => onEdit(contact)} title="Edit">
          ✏️
        </button>
        <button className="action-btn delete-btn" onClick={() => onDelete(contact)} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ContactCard;