import api from './api';

const contactService = {
  // Get all contacts (paginated)
  getAllContacts: async (page = 0, size = 10, sortBy = 'firstName') => {
    const response = await api.get('/contacts', {
      params: { page, size, sortBy },
    });
    return response.data;
  },

  // Search contacts
  searchContacts: async (query, page = 0, size = 10) => {
    const response = await api.get('/contacts/search', {
      params: { query, page, size },
    });
    return response.data;
  },

  // Get single contact
  getContactById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  // Create new contact
  createContact: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  // Update contact
  updateContact: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  // Delete contact
  deleteContact: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  // Toggle favorite status
  toggleFavorite: async (id) => {
    const response = await api.patch(`/contacts/${id}/favorite`);
    return response.data;
  },
};

export default contactService;