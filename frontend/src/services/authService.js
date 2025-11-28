// src/services/authService.js - FIXED VERSION
import api from './api'

// Get token from Clerk
export const getToken = async () => {
  try {
    // Check if Clerk is available
    if (typeof window !== 'undefined' && window.Clerk) {
      const token = await window.Clerk.session?.getToken();
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Sync user with backend - UPDATED VERSION
export const syncUserWithBackend = async () => {
  try {
    const token = await getToken();
    
    if (!token) {
      console.log('No token available for sync');
      return null;
    }

    // Try the sync endpoint, but handle 404 gracefully
    try {
      const response = await api.post('/auth/sync', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (syncError) {
      // If sync endpoint doesn't exist (404), that's okay - user will be created on first protected request
      if (syncError.response?.status === 404) {
        console.log('Sync endpoint not available - user will be created on first protected request');
        return null;
      }
      throw syncError;
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    // Don't throw error - this shouldn't block the app
    return null;
  }
};

// Check if user is admin
export const isUserAdmin = async () => {
  try {
    const token = await getToken();
    if (!token) return false;

    // Try to get user info from a protected endpoint
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Alternative: Check admin status from frontend Clerk data
export const checkAdminFromClerk = (user) => {
  if (!user) return false;
  
  // Check publicMetadata for role
  if (user.publicMetadata?.role === 'admin') {
    return true;
  }
  
  // Check for specific user IDs (fallback)
  const adminUserIds = [
    "user_35yANDeI7IqVMt1pIA2ILe12yh0",
    "user_2h9J7x8X8Q8X8X8X8X8X8X8",
    "user_2h9J7x8X8Q8X8X8X8X8X9"
  ];
  
  return adminUserIds.includes(user.id);
};