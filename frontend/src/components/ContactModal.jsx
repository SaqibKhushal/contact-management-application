import React, { useState, useEffect } from 'react';
import { X, User, Plus, Trash2 } from 'lucide-react';

const ContactModal = ({ isOpen, onClose, onSave, contact, mode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    phoneNumbers: [{ phone: '', label: 'mobile' }],
    emailAddresses: [{ email: '', label: 'personal' }],
    tags: [],
    profileImage: '',
    isFavorite: false
  });

  const [imagePreview, setImagePreview] = useState('');
  const [newImageUploaded, setNewImageUploaded] = useState(false);

  useEffect(() => {
    if (contact && mode === 'edit') {
      setFormData({
        ...contact,
        phoneNumbers: contact.phoneNumbers && contact.phoneNumbers.length > 0 
          ? contact.phoneNumbers 
          : [{ phone: '', label: 'mobile' }],
        emailAddresses: contact.emailAddresses && contact.emailAddresses.length > 0 
          ? contact.emailAddresses 
          : [{ email: '', label: 'personal' }],
        tags: contact.tags || [],
        isFavorite: contact.isFavorite || false
      });
      setImagePreview(contact.profileImage || '');
      setNewImageUploaded(false);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        title: '',
        phoneNumbers: [{ phone: '', label: 'mobile' }],
        emailAddresses: [{ email: '', label: 'personal' }],
        tags: [],
        profileImage: '',
        isFavorite: false
      });
      setImagePreview('');
      setNewImageUploaded(false);
    }

    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [contact, mode, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...formData.phoneNumbers];
    newPhones[index][field] = value;
    setFormData({ ...formData, phoneNumbers: newPhones });
  };

  const handleEmailChange = (index, field, value) => {
    const newEmails = [...formData.emailAddresses];
    newEmails[index][field] = value;
    setFormData({ ...formData, emailAddresses: newEmails });
  };

  const addPhoneNumber = () => {
    setFormData({
      ...formData,
      phoneNumbers: [...formData.phoneNumbers, { phone: '', label: 'mobile' }]
    });
  };

  const removePhoneNumber = (index) => {
    if (formData.phoneNumbers.length > 1) {
      const newPhones = formData.phoneNumbers.filter((_, i) => i !== index);
      setFormData({ ...formData, phoneNumbers: newPhones });
    }
  };

  const addEmailAddress = () => {
    setFormData({
      ...formData,
      emailAddresses: [...formData.emailAddresses, { email: '', label: 'personal' }]
    });
  };

  const removeEmailAddress = (index) => {
    if (formData.emailAddresses.length > 1) {
      const newEmails = formData.emailAddresses.filter((_, i) => i !== index);
      setFormData({ ...formData, emailAddresses: newEmails });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setImagePreview(base64);
        setFormData({ ...formData, profileImage: base64 });
        setNewImageUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, tags: currentTags.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty phone numbers and emails
    const filteredData = {
      ...formData,
      phoneNumbers: formData.phoneNumbers.filter(p => p.phone.trim() !== ''),
      emailAddresses: formData.emailAddresses.filter(e => e.email.trim() !== ''),
      // Only send profileImage if it's a new upload or in create mode
      profileImage: (mode === 'edit' && !newImageUploaded) ? contact.profileImage : formData.profileImage
    };
    
    onSave(filteredData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-800">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'edit' ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-700">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-zinc-500" />
              )}
            </div>
            <label htmlFor="profileImage" className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
              Upload Photo
              <input 
                type="file" 
                id="profileImage"
                name="profileImage"
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden"
                aria-label="Upload profile photo" 
              />
            </label>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              autoComplete="given-name"
              aria-label="First name"
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              autoComplete="family-name"
              aria-label="Last name"
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Title */}
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title / Position"
            autoComplete="organization-title"
            aria-label="Job title or position"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />

          {/* Phone Numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-zinc-400">Phone Numbers</label>
              <button
                type="button"
                onClick={addPhoneNumber}
                className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Add Phone
              </button>
            </div>
            {formData.phoneNumbers.map((phone, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  id={`phoneLabel-${idx}`}
                  name={`phoneLabel-${idx}`}
                  value={phone.label || 'mobile'}
                  onChange={(e) => handlePhoneChange(idx, 'label', e.target.value)}
                  aria-label={`Phone type ${idx + 1}`}
                  className="px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="mobile">Mobile</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="tel"
                  id={`phone-${idx}`}
                  name={`phone-${idx}`}
                  value={phone.phone}
                  onChange={(e) => handlePhoneChange(idx, 'phone', e.target.value)}
                  placeholder="Phone number"
                  autoComplete="tel"
                  aria-label={`Phone number ${idx + 1}`}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                {formData.phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoneNumber(idx)}
                    aria-label={`Remove phone number ${idx + 1}`}
                    className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Email Addresses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-zinc-400">Email Addresses</label>
              <button
                type="button"
                onClick={addEmailAddress}
                className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Add Email
              </button>
            </div>
            {formData.emailAddresses.map((email, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  id={`emailLabel-${idx}`}
                  name={`emailLabel-${idx}`}
                  value={email.label || 'personal'}
                  onChange={(e) => handleEmailChange(idx, 'label', e.target.value)}
                  aria-label={`Email type ${idx + 1}`}
                  className="px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="email"
                  id={`email-${idx}`}
                  name={`email-${idx}`}
                  value={email.email}
                  onChange={(e) => handleEmailChange(idx, 'email', e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  aria-label={`Email address ${idx + 1}`}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                {formData.emailAddresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmailAddress(idx)}
                    aria-label={`Remove email address ${idx + 1}`}
                    className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Tags</label>
            <div className="flex flex-wrap gap-2">
              {['Family', 'Friend', 'Work', 'Important'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    (formData.tags || []).includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;