// src/services/commentService.js
import api from './api'

export const getCommentsByJob = async (jobId, params = {}) => {
  const response = await api.get(`/comments/job/${jobId}`, { params })
  return response.data
}

export const createComment = async (commentData) => {
  const response = await api.post('/comments', commentData)
  return response.data
}

export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`)
  return response.data
}