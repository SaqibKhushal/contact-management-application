import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Camera, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import LoadingSpinner from "../components/LoadingSpinner";
import DeleteAccountModal from "../components/DeleteAccountModal";
import "./Profile.css";

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await userService.getProfile();
      const userData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
      };
      setFormData(userData);
      setOriginalData(userData);
      
      // Load profile image from localStorage using user-specific key
      // CRITICAL: Each user's profile image is stored with their ID to prevent data leakage
      const userImageKey = `userProfileImage_${data.id}`;
      const savedImage = localStorage.getItem(userImageKey);
      if (savedImage) {
        setImagePreview(savedImage);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setImagePreview(base64);
        
        // Get current user data to use their ID for storage key
        try {
          const userData = await userService.getProfile();
          const userImageKey = `userProfileImage_${userData.id}`;
          localStorage.setItem(userImageKey, base64);
          // Removed 'Profile image updated!' toast
        } catch (error) {
          console.error("Failed to save profile image:", error);
          toast.error(error.message || "Failed to save profile image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    setImagePreview("");
    
    // Remove image using user-specific key
    try {
      const userData = await userService.getProfile();
      const userImageKey = `userProfileImage_${userData.id}`;
      localStorage.removeItem(userImageKey);
      // Removed 'Profile image removed!' toast
    } catch (error) {
      console.error("Failed to remove profile image:", error);
      toast.error(error.message || "Failed to remove profile image");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim() || null,
      };

      const updated = await userService.updateUserProfile(updateData);
      
      // Update both form data and original data
      const newData = {
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        email: updated.email || "",
        phoneNumber: updated.phoneNumber || "",
      };
      setFormData(newData);
      setOriginalData(newData);
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success("Password changed successfully!");
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast.success("Account deleted successfully");
      localStorage.clear();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || "User";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <button onClick={() => navigate("/all-contacts")} className="back-btn">
          <ArrowLeft size={18} />
          Back to Contacts
        </button>
      </div>

      <div className="profile-content">
        {/* Profile Image Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Profile Picture</h2>
          </div>
          <div className="profile-image-section">
            <div className="profile-image-container">
              <div className="profile-image-wrapper" title={fullName}>
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt={fullName} 
                    className="profile-image-preview"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <User size={64} />
                  </div>
                )}
                <div className="profile-image-tooltip">{fullName}</div>
              </div>
              <label htmlFor="profile-image-upload" className="profile-image-upload-btn" title="Upload photo">
                <Camera size={20} />
                <input
                  id="profile-image-upload"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  aria-label="Upload profile photo"
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className="profile-image-actions">
              <p className="profile-image-hint">Upload a photo (max 5MB)</p>
              {imagePreview && (
                <button 
                  onClick={handleRemoveImage} 
                  className="remove-image-btn"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Personal Information</h2>
            {isEditing ? null : (
              <button
                onClick={() => setIsEditing(true)}
                className="edit-toggle-btn"
              >
                Edit
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  required
                  autoComplete="given-name"
                  aria-label="First name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  required
                  autoComplete="family-name"
                  aria-label="Last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                required
                autoComplete="email"
                aria-label="Email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="Optional"
                autoComplete="tel"
                aria-label="Phone number"
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <button 
                  type="button"
                  onClick={handleCancelEdit} 
                  className="cancel-btn"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Enter current password"
                autoComplete="current-password"
                aria-label="Current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Enter new password (min 6 characters)"
                autoComplete="new-password"
                aria-label="New password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="form-input"
                placeholder="Confirm new password"
                autoComplete="new-password"
                aria-label="Confirm new password"
              />
            </div>

            <button 
              type="submit" 
              className="save-btn"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Account Actions Card */}
        <div className="profile-card danger-card">
          <div className="card-header">
            <h2>Danger Zone</h2>
          </div>
          <p className="danger-text">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="delete-account-btn"
          >
            Delete Account
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        userName={fullName}
      />
    </div>
  );
};

export default Profile;
