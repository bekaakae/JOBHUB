import api from './api';
import { getToken } from './authService';

// Check for temporary admin in localStorage
const isTempAdmin = () => {
  return localStorage.getItem('jobhub_temp_admin') === 'true';
};

// Enhanced response handler for single job responses
const handleJobResponse = (response) => {
  console.log('📡 Job API Response received:', response);
  
  // If response is already the data we need
  if (response && response.success !== undefined) {
    return response;
  }
  
  // If response has data property with success field
  if (response && response.data && response.data.success !== undefined) {
    return response.data;
  }
  
  // If response is the job data directly
  if (response && response._id) {
    return {
      success: true,
      data: response
    };
  }
  
  // Default fallback
  console.warn('⚠️ Unexpected job response structure:', response);
  return {
    success: false,
    message: 'Unexpected response format',
    data: null
  };
};

// Simple retry logic with delays
const fetchWithRetry = async (url, options = {}, retries = 2) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt} for ${url}`);
      const response = await api.get(url, options);
      return response;
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (error.response?.status === 429 && attempt < retries) {
        const delay = 2000; // 2 seconds
        console.log(`⏳ Rate limited, waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For other errors or final retry, throw the error
      throw error;
    }
  }
};

export const createJob = async (jobData) => {
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

    if (isTempAdmin()) {
      config.headers['x-temp-admin'] = 'true';
    }

    const response = await api.post('/jobs', jobData, config);
    return handleJobResponse(response.data);
  } catch (error) {
    console.error('❌ Error creating job:', error);
    throw error;
  }
};

export const getJobs = async (params = {}) => {
  try {
    const response = await fetchWithRetry('/jobs', { params });
    return handleJobResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    // Return empty array structure on error
    return { 
      success: false, 
      message: error.message,
      data: [] 
    };
  }
};

export const getJob = async (id) => {
  try {
    console.log(`🔄 Fetching job with ID: ${id}`);
    const response = await fetchWithRetry(`/jobs/${id}`);
    console.log('✅ Job API response received:', response.data);
    
    const processedResponse = handleJobResponse(response.data);
    console.log('📦 Processed job response:', processedResponse);
    
    return processedResponse;
  } catch (error) {
    console.error(`❌ Error fetching job ${id}:`, error);
    
    // Return a consistent error structure
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to load job details',
      error: error
    };
  }
};

export const updateJob = async (id, jobData) => {
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

    if (isTempAdmin()) {
      config.headers['x-temp-admin'] = 'true';
    }

    const response = await api.put(`/jobs/${id}`, jobData, config);
    return handleJobResponse(response.data);
  } catch (error) {
    console.error('❌ Error updating job:', error);
    throw error;
  }
};

export const deleteJob = async (id) => {
  try {
    const token = await getToken();
    
    const config = {
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isTempAdmin()) {
      config.headers['x-temp-admin'] = 'true';
    }

    const response = await api.delete(`/jobs/${id}`, config);
    return handleJobResponse(response.data);
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    console.log('🔄 Fetching categories from API...');
    const response = await fetchWithRetry('/categories');
    console.log('✅ Categories API call successful, processing response...');
    
    return handleJobResponse(response.data);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    
    // For other errors, return empty array
    return { 
      success: false, 
      message: error.message,
      data: [] 
    };
  }
};