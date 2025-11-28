import api from './api';

export const toggleLike = async (jobId) => {
  const response = await api.post('/likes/toggle', { jobId });
  return response.data;
};

export const getLikesByJob = async (jobId) => {
  const response = await api.get(`/likes/job/${jobId}`);
  return response.data;
};

export const checkUserLike = async (jobId) => {
  const response = await api.get(`/likes/job/${jobId}/check`);
  return response.data;
};