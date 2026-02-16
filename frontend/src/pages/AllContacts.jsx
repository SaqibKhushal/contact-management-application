import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Search, Star, Phone, Video, MessageCircle, Mail, Calendar, Edit2, Trash2, User, LogOut } from 'lucide-react';
import contactService from '../services/contactService';
import ContactModal from '../components/ContactModal';
import DeleteModal from '../components/DeleteModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import './AllContacts.css';

// Reusable Component: Avatar with image fallback
const ContactAvatar = ({ contact, getInitials, onImageError, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    default: 'w-10 h-10 text-sm',
    large: 'w-24 h-24 text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-zinc-800 flex items-center justify-center font-medium overflow-hidden flex-shrink-0 ${size === 'large' ? 'border-2 border-zinc-800' : ''}`}>
      {contact.profileImage && contact.profileImage.trim() !== '' ? (
        <img 
          src={contact.profileImage} 
          alt={`${contact.firstName} ${contact.lastName}`} 
          className="w-full h-full object-cover" 
          onError={(e) => onImageError(e, contact)}
        />
      ) : (
        getInitials(contact)
      )}
    </div>
  );
};

// Reusable Component: Tag dots preview
const ContactTagsPreview = ({ contact, getTagColor, showCount = 2 }) => {
  if (!contact.tags || contact.tags.length === 0) return null;
  
  return (
    <div className="flex gap-1">
      {contact.tags.slice(0, showCount).map((tag) => (
        <span
          key={`${contact.id}-${tag}`}
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: getTagColor(tag) }}
        />
      ))}
    </div>
  );
};

// Reusable Component: Favorite button
const FavoriteButton = ({ contact, onClick }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0"
  >
    <Star size={16} className={contact.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-600'} />
  </button>
);

// Reusable Component: Contact item card
const ContactItem = ({ 
  contact, 
  isSelected, 
  onClick, 
  onKeyDown, 
  onFavoriteClick,
  getInitials,
  getTagColor,
  onImageError,
  showMultipleTags = false
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={onKeyDown}
    className={`px-4 py-3 cursor-pointer transition flex items-center gap-3 ${
      isSelected ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'
    }`}
  >
    <ContactAvatar 
      contact={contact} 
      getInitials={getInitials} 
      onImageError={onImageError}
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <h3 className="text-sm font-medium text-white truncate">
          {contact.firstName} {contact.lastName}
        </h3>
        {showMultipleTags && contact.tags && contact.tags.length > 1 && (
          <ContactTagsPreview contact={contact} getTagColor={getTagColor} />
        )}
        {!showMultipleTags && (
          <ContactTagsPreview contact={contact} getTagColor={getTagColor} />
        )}
      </div>
      <p className="text-xs text-zinc-500 truncate">{contact.title || 'No title'}</p>
    </div>
    <FavoriteButton contact={contact} onClick={onFavoriteClick} />
  </div>
);

// Reusable Component: Tag group header and contacts
const TagGroup = ({ 
  tag, 
  contacts, 
  selectedContactId,
  onContactClick,
  onContactKeyDown,
  onFavoriteClick,
  getInitials,
  getTagColor,
  onImageError
}) => (
  <div className="mb-4">
    {/* Tag heading with tag color */}
    <div className="px-4 py-2 sticky top-0 bg-zinc-950 z-10 border-b border-zinc-800">
      <h3 
        className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
        style={{ color: getTagColor(tag) }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTagColor(tag) }}></span>
        {tag}
        <span className="text-xs text-zinc-500 font-normal ml-auto">({contacts.length})</span>
      </h3>
    </div>
    
    {/* Contacts under this tag */}
    {contacts.map(contact => (
      <ContactItem
        key={`${tag}-${contact.id}`}
        contact={contact}
        isSelected={selectedContactId === contact.id}
        onClick={() => onContactClick(contact)}
        onKeyDown={(e) => onContactKeyDown(e, contact)}
        onFavoriteClick={(e) => onFavoriteClick(e, contact)}
        getInitials={getInitials}
        getTagColor={getTagColor}
        onImageError={onImageError}
        showMultipleTags={true}
      />
    ))}
  </div>
);

const AllContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeTab, setActiveTab] = useState('contacts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [userProfileImage, setUserProfileImage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await contactService.getAllContacts(0, 100);
      setContacts(response.content || []);
      if (response.content && response.content.length > 0) {
        setSelectedContact(response.content[0]);
      }
    } catch (error) {
      // Only show error if not a 401 (handled by interceptor redirect to login)
      if (error.response?.status !== 401) {
        console.error('Failed to fetch contacts:', error);
        // Don't show toast - user will see empty list which is fine
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserDataAndContacts = useCallback(async () => {
    // Fetch contacts
    await fetchContacts();
    
    // Load user profile image using user-specific key
    // CRITICAL: Only load the current user's profile image
    if (user?.id) {
      const userImageKey = `userProfileImage_${user.id}`;
      const savedImage = localStorage.getItem(userImageKey);
      if (savedImage) {
        setUserProfileImage(savedImage);
      } else {
        setUserProfileImage(''); // Clear any stale image
      }
    }
  }, [user, fetchContacts]);

  useEffect(() => {
    loadUserDataAndContacts();
  }, [loadUserDataAndContacts]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Reset mobile detail view when switching to desktop
      if (!mobile) {
        setShowDetailOnMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateContact = () => {
    setModalMode('create');
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleEditContact = () => {
    if (selectedContact) {
      setModalMode('edit');
      setIsModalOpen(true);
    }
  };

  const handleDeleteContact = () => {
    if (selectedContact) {
      setIsDeleteModalOpen(true);
    }
  };

  const handleSaveContact = async (contactData) => {
    try {
      if (modalMode === 'create') {
        await contactService.createContact(contactData);
        toast.success('Contact created successfully!');
      } else if (modalMode === 'edit') {
        await contactService.updateContact(selectedContact.id, contactData);
        // Removed 'Contact updated successfully!' toast
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await contactService.deleteContact(selectedContact.id);
      toast.success('Contact deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const toggleFavorite = async (contact) => {
    // Optimistic UI update
    const updatedContacts = contacts.map(c => 
      c.id === contact.id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    setContacts(updatedContacts);
    
    if (selectedContact?.id === contact.id) {
      setSelectedContact({ ...selectedContact, isFavorite: !selectedContact.isFavorite });
    }

    // Persist to backend using dedicated API (removed success toast)
    try {
      await contactService.toggleFavorite(contact.id);
    } catch (error) {
      // Revert on error using functional update
      setContacts(prevContacts => prevContacts.map(c => 
        c.id === contact.id ? { ...c, isFavorite: !c.isFavorite } : c
      ));
      if (selectedContact?.id === contact.id) {
        setSelectedContact(contact);
      }
      toast.error('Failed to update favorite status');
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getFilteredContacts = () => {
    let filtered = contacts;
    if (searchQuery) {
      filtered = filtered.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === 'favorites') {
      filtered = filtered.filter(c => c.isFavorite);
    } else if (activeTab === 'tags') {
      filtered = filtered.filter(c => c.tags && c.tags.length > 0);
    }
    return filtered;
  };

  // Group contacts by tags for the Tags tab view
  const getContactsGroupedByTags = () => {
    const grouped = {};
    const filtered = getFilteredContacts();
    
    filtered.forEach(contact => {
      if (contact.tags && contact.tags.length > 0) {
        contact.tags.forEach(tag => {
          if (!grouped[tag]) {
            grouped[tag] = [];
          }
          // Add contact to this tag group (may appear in multiple groups)
          grouped[tag].push(contact);
        });
      }
    });
    
    return grouped;
  };

  const getInitials = (contact) => {
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

  // Event handler: Contact selection
  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    if (isMobile) {
      setShowDetailOnMobile(true);
    }
  };

  // Event handler: Contact selection via keyboard
  const handleContactKeyDown = (e, contact) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedContact(contact);
      if (isMobile) {
        setShowDetailOnMobile(true);
      }
    }
  };

  // Event handler: Toggle favorite with stop propagation
  const handleFavoriteClick = (e, contact) => {
    e.stopPropagation();
    toggleFavorite(contact);
  };

  // Event handler: Profile image error fallback
  const handleImageError = (e, contact) => {
    e.target.style.display = 'none';
    e.target.parentElement.textContent = getInitials(contact);
  };

  // Event handler: Tab change with mobile handling
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile && showDetailOnMobile) {
      setShowDetailOnMobile(false);
    }
  };

  // Event handler: Profile navigation
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Event handler: Logout
  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  // Event handler: Profile image error with SVG fallback
  const handleProfileImageError = (e) => {
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
  };

  // Event handler: Back to list on mobile
  const handleBackToList = () => {
    setShowDetailOnMobile(false);
  };

  // Helper function to render contacts list (extracted to avoid nested ternary)
  const renderContactsList = () => {
    if (filteredContacts.length === 0) {
      return (
        <div className="p-8 text-center text-zinc-500">
          <p className="mb-4">No contacts found</p>
          <button onClick={handleCreateContact} className="text-blue-500 hover:text-blue-400 text-sm">
            Add your first contact
          </button>
        </div>
      );
    }

    if (activeTab === 'tags' && groupedByTags) {
      return Object.entries(groupedByTags).map(([tag, tagContacts]) => (
        <TagGroup
          key={tag}
          tag={tag}
          contacts={tagContacts}
          selectedContactId={selectedContact?.id}
          onContactClick={handleContactClick}
          onContactKeyDown={handleContactKeyDown}
          onFavoriteClick={handleFavoriteClick}
          getInitials={getInitials}
          getTagColor={getTagColor}
          onImageError={handleImageError}
        />
      ));
    }

    // Regular list view
    return filteredContacts.map(contact => (
      <ContactItem
        key={contact.id}
        contact={contact}
        isSelected={selectedContact?.id === contact.id}
        onClick={() => handleContactClick(contact)}
        onKeyDown={(e) => handleContactKeyDown(e, contact)}
        onFavoriteClick={(e) => handleFavoriteClick(e, contact)}
        getInitials={getInitials}
        getTagColor={getTagColor}
        onImageError={handleImageError}
      />
    ));
  };

  const filteredContacts = getFilteredContacts();
  const groupedByTags = activeTab === 'tags' ? getContactsGroupedByTags() : null;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex gap-8">
            {['contacts', 'favorites', 'tags'].map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`text-sm font-medium capitalize transition relative pb-1 ${
                  activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleProfileClick}
              className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center overflow-hidden transition border-2 border-zinc-700"
              title="Profile"
            >
              {userProfileImage ? (
                <img 
                  src={userProfileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={handleProfileImageError}
                />
              ) : (
                <User size={18} />
              )}
            </button>
            <button 
              onClick={handleLogoutClick}
              className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Hidden on mobile when detail view is shown */}
        <aside className={`w-full md:w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col ${
          isMobile && showDetailOnMobile ? 'hidden' : 'block'
        }`}>
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <button
              onClick={handleCreateContact}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              <Plus size={18} />
              Add Contact
            </button>
          </div>

          <div className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Contacts · {filteredContacts.length}
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderContactsList()}
          </div>
        </aside>

        {/* Main Content - Hidden on mobile when detail view is not shown */}
        <main className={`flex-1 overflow-y-auto bg-black ${
          isMobile && !showDetailOnMobile ? 'hidden' : 'block'
        } md:block`}>
          {selectedContact ? (
            <div className="max-w-3xl mx-auto p-8">
              {/* Back button for mobile */}
              {isMobile && showDetailOnMobile && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  <span className="text-sm font-medium">Back to contacts</span>
                </button>
              )}
              <div className="mb-8">
                <div className="flex items-start gap-6 mb-6">
                  <ContactAvatar 
                    contact={selectedContact} 
                    getInitials={getInitials} 
                    onImageError={handleImageError}
                    size="large"
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-1">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h1>
                    <p className="text-zinc-400 mb-3">{selectedContact.title || 'No title'}</p>
                    {selectedContact.tags && selectedContact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedContact.tags.map((tag) => (
                          <span
                            key={`detail-${tag}`}
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getTagColor(tag) }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition">
                    <Phone size={18} />
                    Call
                  </button>
                  <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition">
                    <Video size={18} />
                    Video
                  </button>
                  <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition">
                    <MessageCircle size={18} />
                    Message
                  </button>
                  <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition">
                    <Mail size={18} />
                    Email
                  </button>
                </div>

                <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 font-medium transition">
                  <Calendar size={18} />
                  Schedule a call
                </button>
              </div>

              <div className="space-y-6">
                {selectedContact.phoneNumbers && selectedContact.phoneNumbers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Phone Numbers</h3>
                    {selectedContact.phoneNumbers.map((phone) => (
                      <div key={`phone-${phone.phone}`} className="py-2">
                        <div className="text-white">{phone.phone}</div>
                        <div className="text-xs text-zinc-500 capitalize">{phone.label || 'mobile'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedContact.emailAddresses && selectedContact.emailAddresses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Email Addresses</h3>
                    {selectedContact.emailAddresses.map((email) => (
                      <div key={`email-${email.email}`} className="py-2">
                        <div className="text-white">{email.email}</div>
                        <div className="text-xs text-zinc-500 capitalize">{email.label || 'personal'}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleEditContact}
                    className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-2 font-medium transition"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteContact}
                    className="flex-1 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg flex items-center justify-center gap-2 font-medium transition"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              <p>Select a contact to view details</p>
            </div>
          )}
        </main>
      </div>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        contact={selectedContact}
        mode={modalMode}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        contact={selectedContact}
      />
    </div>
  );
};

export default AllContacts;