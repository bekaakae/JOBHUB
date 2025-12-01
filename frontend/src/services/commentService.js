// src/services/commentService.js
import api from './api';
import { getToken } from './authService';

export const getCommentsByJob = async (jobId, params = {}) => {
  try {
    const response = await api.get(`/comments/job/${jobId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const createComment = async (commentData) => {
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

    const response = await api.post('/comments', commentData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const deleteComment = async (id) => {
  try {
    const token = await getToken();
    
    const config = {
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.delete(`/comments/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};