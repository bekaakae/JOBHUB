// src/reducers/jobReducer.js - UPDATED
export const initialState = {
  jobs: [],
  categories: [],
  selectedJob: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    location: '',
    jobType: '',
    experienceLevel: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
}

export const jobReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, error: null }
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    
    case 'SET_SELECTED_JOB':
      return { ...state, selectedJob: action.payload }
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      }
    
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } }
    
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] }
    
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job._id === action.payload._id ? action.payload : job
        ),
        selectedJob: state.selectedJob?._id === action.payload._id ? action.payload : state.selectedJob
      }
    
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job._id !== action.payload)
      }
    
    case 'ADD_COMMENT':
      if (!state.selectedJob) return state
      return {
        ...state,
        selectedJob: {
          ...state.selectedJob,
          comments: [action.payload, ...(state.selectedJob.comments || [])]
        }
      }
    
    case 'UPDATE_LIKE':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job._id === action.payload.jobId
            ? { ...job, likesCount: action.payload.likesCount, userHasLiked: action.payload.userHasLiked }
            : job
        ),
        selectedJob: state.selectedJob?._id === action.payload.jobId
          ? { ...state.selectedJob, likesCount: action.payload.likesCount, userHasLiked: action.payload.userHasLiked }
          : state.selectedJob
      }
    
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters }
    
    default:
      return state
  }
}