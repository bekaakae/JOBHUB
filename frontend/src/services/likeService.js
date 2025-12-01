// src/services/likeService.js
import api from './api';
import { getToken } from './authService';

export const toggleLike = async (jobId) => {
  try {
    const token = await getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.post('/likes/toggle', { jobId }, config);
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const getLikesByJob = async (jobId) => {
  try {
    const response = await api.get(`/likes/job/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching likes:', error);
    throw error;
  }
};

export const checkUserLike = async (jobId) => {
  try {
    const token = await getToken();
    
    const config = {
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.get(`/likes/job/${jobId}/check`, config);
    return response.data;
  } catch (error) {
    console.error('Error checking user like:', error);
    throw error;
  }
};