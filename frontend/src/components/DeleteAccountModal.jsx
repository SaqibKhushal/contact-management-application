import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        <button onClick={onClose} className="delete-modal-close">
          <X size={24} />
        </button>
        
        <div className="delete-modal-icon">
          <AlertTriangle size={48} className="warning-icon" />
        </div>
        
        <h2 className="delete-modal-title">Delete Account</h2>
        
        <p className="delete-modal-message">
          Are you absolutely sure you want to delete your account?
        </p>
        
        <div className="delete-modal-warning">
          <p><strong>This action cannot be undone.</strong> This will permanently delete:</p>
          <ul>
            <li>Your profile and personal information</li>
            <li>All your contacts and their data</li>
            <li>Your account settings and preferences</li>
          </ul>
        </div>
        
        <div className="delete-modal-actions">
          <button onClick={onClose} className="delete-modal-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-modal-confirm">
            Yes, Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
