import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">📇</span>
          Contact Manager
        </Link>

        {isAuthenticated && (
          <div className="navbar-menu">
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
            <Link to="/all-contacts" className="navbar-link">
              All Contacts
            </Link>
            <Link to="/profile" className="navbar-link">
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;