// src/services/api.js - UPDATED VERSION
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

// Request interceptor to add temp admin header
api.interceptors.request.use(
  async (config) => {
    // Add temporary admin header for development
    const isTempAdmin = localStorage.getItem('jobhub_temp_admin') === 'true';
    if (isTempAdmin && !config.headers['x-temp-admin']) {
      config.headers['x-temp-admin'] = 'true';
    }
    
    // Clerk automatically handles auth via cookies
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message
    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

export default api