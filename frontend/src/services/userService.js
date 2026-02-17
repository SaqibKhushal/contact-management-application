import api from "./api";

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put("/user/profile", profileData);
    return response.data;
  },

  // Alias for updateProfile to support both naming conventions
  updateUserProfile: async (profileData) => {
    const response = await api.put("/user/profile", profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put("/user/change-password", passwordData);
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete("/user/account");
    return response.data;
  },
};

export default userService;
